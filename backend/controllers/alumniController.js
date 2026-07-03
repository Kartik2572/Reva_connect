import { pool } from "../config/db.js";
import { logger } from "../utils/logger.js";

const formatAlumniRow = (row) => ({
  ...row,
  graduationYear: row.graduationYear,
  branchOrCompany: row.branchOrCompany,
  verificationStatus: row.verificationStatus
});

export const getAlumni = async (req, res) => {
  try {
    const {
      company,
      domain,
      graduationYear,
      branch,
      location,
      verificationStatus,
      search
    } = req.query;

    const whereParts = [
      `EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = a.user_id
        AND LOWER(u.role) = 'alumni'
      )`
    ];
    const params = [];
    let idx = 1;

    const addIlike = (column, value) => {
      const v = String(value).trim();
      if (!v) return;
      whereParts.push(`${column} ILIKE $${idx}`);
      params.push(`%${v}%`);
      idx += 1;
    };

    if (company) addIlike("a.company", company);
    if (domain) addIlike("a.domain", domain);
    if (branch) addIlike("a.branch_or_company", branch);
    if (location) addIlike("a.location", location);

    if (graduationYear !== undefined && String(graduationYear).trim() !== "") {
      const y = parseInt(String(graduationYear).trim(), 10);
      if (Number.isInteger(y)) {
        whereParts.push(`a.graduation_year = $${idx}`);
        params.push(y);
        idx += 1;
      }
    }

    if (verificationStatus && String(verificationStatus).trim()) {
      whereParts.push(`a.verification_status = $${idx}`);
      params.push(String(verificationStatus).trim());
      idx += 1;
    }

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      whereParts.push(
        `(a.name ILIKE $${idx} OR COALESCE(a.company, '') ILIKE $${idx} OR COALESCE(a.domain, '') ILIKE $${idx} OR COALESCE(a.branch_or_company, '') ILIKE $${idx})`
      );
      params.push(term);
      idx += 1;
    }

    const whereSql = whereParts.join(" AND ");
    const result = await pool.query(
      `SELECT a.id, a.name, a.role, a.company, a.branch_or_company AS "branchOrCompany", a.graduation_year AS "graduationYear", a.experience, a.domain, a.location, a.status, a.verification_status AS "verificationStatus"
       FROM alumni a
       WHERE ${whereSql}
       ORDER BY a.name`,
      params
    );
    res.json({ success: true, data: result.rows.map(formatAlumniRow) });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error getting alumni");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAlumnusById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"
       FROM alumni
       WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Alumnus not found" });
    }

    res.json({ success: true, data: formatAlumniRow(result.rows[0]) });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error getting alumnus by ID");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createAlumnus = async (req, res) => {
  try {
    const {
      name,
      role,
      company,
      branchOrCompany,
      graduationYear,
      experience,
      domain,
      location,
      status = "Pending",
      verificationStatus = "Pending"
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const result = await pool.query(
      `INSERT INTO alumni (name, role, company, branch_or_company, graduation_year, experience, domain, location, status, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"`,
      [String(name).trim(), role, company, branchOrCompany, graduationYear, experience, domain, location, status, verificationStatus]
    );

    res.status(201).json({ success: true, data: formatAlumniRow(result.rows[0]) });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error creating alumnus");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateAlumnus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, company, email, role, branchOrCompany, graduationYear, experience, domain, location, status, verificationStatus } = req.body;
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      ["name", "name"],
      ["role", "role"],
      ["company", "company"],
      ["branchOrCompany", "branch_or_company"],
      ["graduationYear", "graduation_year"],
      ["experience", "experience"],
      ["domain", "domain"],
      ["location", "location"],
      ["status", "status"],
      ["verificationStatus", "verification_status"]
    ];

    allowedFields.forEach(([bodyKey, columnKey]) => {
      if (req.body[bodyKey] !== undefined) {
        updateValues.push(req.body[bodyKey]);
        updateFields.push(`${columnKey} = $${updateValues.length}`);
      }
    });

    if (!updateFields.length && email === undefined) {
      return res.status(400).json({ success: false, message: "No update fields provided" });
    }

    await client.query("BEGIN");

    const currentResult = await client.query(
      "SELECT name FROM alumni WHERE id = $1",
      [id]
    );

    if (!currentResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Alumnus not found" });
    }

    const currentName = currentResult.rows[0].name;

    if (updateFields.length) {
      updateValues.push(id);
      const updateQuery = `UPDATE alumni SET ${updateFields.join(", ")} WHERE id = $${updateValues.length} RETURNING id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"`;
      const updateResult = await client.query(updateQuery, updateValues);

      if (!updateResult.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: "Alumnus not found" });
      }
    }

    if (email !== undefined || name !== undefined) {
      const userId = req.user?.id;
      if (userId) {
        const userFields = [];
        const userValues = [];

        if (name !== undefined) {
          userFields.push(`name = $${userValues.length + 1}`);
          userValues.push(name);
        }
        if (email !== undefined) {
          userFields.push(`email = $${userValues.length + 1}`);
          userValues.push(email);
        }

        if (userFields.length) {
          userValues.push(userId);
          await client.query(
            `UPDATE users SET ${userFields.join(", ")} WHERE id = $${userValues.length}`,
            userValues
          );
        }
      }
    }

    if (name !== undefined && name.trim() !== "" && currentName.trim() !== "") {
      await client.query("UPDATE events SET host = $1 WHERE host = $2", [name, currentName]);
      await client.query("UPDATE posts SET author = $1 WHERE author = $2", [name, currentName]);
    }

    await client.query("COMMIT");

    const finalResult = await pool.query(
      `SELECT id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"
       FROM alumni
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true, data: formatAlumniRow(finalResult.rows[0]) });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ error: error.message, stack: error.stack }, "Error updating alumnus");
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const deleteAlumnus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM alumni WHERE id = $1 RETURNING id", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Alumnus not found" });
    }

    res.status(200).json({ success: true, message: "Alumnus deleted" });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error deleting alumnus");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const requestAlumniVerification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students are allowed to request alumni access."
      });
    }

    const {
      company,
      role, // representing "Current Job Role"
      experience,
      domain,
      location,
      graduationYear,
      branch,
      linkedinProfile
    } = req.body;

    // Field validations
    if (
      !company?.trim() ||
      !role?.trim() ||
      experience === undefined ||
      experience === null ||
      !domain?.trim() ||
      !location?.trim() ||
      !graduationYear ||
      !branch?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields except LinkedIn profile are required."
      });
    }

    const expVal = Number(experience);
    if (isNaN(expVal) || expVal < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid non-negative number."
      });
    }

    const gradYearVal = Number(graduationYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(gradYearVal) || gradYearVal < 1950 || gradYearVal > currentYear + 10) {
      return res.status(400).json({
        success: false,
        message: "Graduation year must be a valid year."
      });
    }

    // Get user's current name from database
    const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    if (!userRes.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    const studentName = userRes.rows[0].name;

    // Check if there is an existing alumni request for this user
    const existingReq = await pool.query(
      "SELECT id, status, verification_status AS \"verificationStatus\" FROM alumni WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    let alumniId = null;

    if (existingReq.rows.length > 0) {
      const record = existingReq.rows[0];
      const verificationStatus = record.verificationStatus;

      if (verificationStatus === "Approved") {
        return res.status(400).json({
          success: false,
          message: "You are already an approved alumni."
        });
      }

      if (verificationStatus === "Pending") {
        return res.status(400).json({
          success: false,
          message: "You already have a pending alumni verification request."
        });
      }

      // If status/verificationStatus is 'Rejected', allow update/resubmission
      // "Update existing alumni record instead of creating duplicates."
      const updateResult = await pool.query(
        `UPDATE alumni 
         SET name = $1, role = $2, company = $3, branch_or_company = $4, graduation_year = $5, experience = $6, domain = $7, location = $8, linkedin_profile = $9, status = 'Pending', verification_status = 'Pending'
         WHERE user_id = $10
         RETURNING id`,
        [
          studentName,
          role.trim(),
          company.trim(),
          branch.trim(),
          gradYearVal,
          expVal,
          domain.trim(),
          location.trim(),
          linkedinProfile?.trim() || null,
          userId
        ]
      );
      alumniId = updateResult.rows[0].id;
    } else {
      // Create new pending record
      const insertResult = await pool.query(
        `INSERT INTO alumni (user_id, name, role, company, branch_or_company, graduation_year, experience, domain, location, linkedin_profile, status, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending', 'Pending')
         RETURNING id`,
        [
          userId,
          studentName,
          role.trim(),
          company.trim(),
          branch.trim(),
          gradYearVal,
          expVal,
          domain.trim(),
          location.trim(),
          linkedinProfile?.trim() || null
        ]
      );
      alumniId = insertResult.rows[0].id;
    }

    // Update branch in users table to stay in sync
    await pool.query("UPDATE users SET branch = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [branch.trim(), userId]);

    return res.status(200).json({
      success: true,
      message: "Alumni request submitted successfully.",
      data: { alumniId }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error requesting alumni verification");
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

export const getMyAlumniRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized."
      });
    }

    const result = await pool.query(
      `SELECT id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, linkedin_profile AS "linkedinProfile", status, verification_status AS "verificationStatus"
       FROM alumni
       WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error getting user alumni request status");
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
