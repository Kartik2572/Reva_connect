import { pool } from "../config/db.js";

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
        WHERE LOWER(TRIM(u.name)) = LOWER(TRIM(a.name))
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
    res.json({ data: result.rows.map(formatAlumniRow) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching alumni" });
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

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const result = await pool.query(
      `INSERT INTO alumni (name, role, company, branch_or_company, graduation_year, experience, domain, location, status, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"`,
      [name, role, company, branchOrCompany, graduationYear, experience, domain, location, status, verificationStatus]
    );

    res.status(201).json({ data: formatAlumniRow(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating alumnus" });
  }
};

export const updateAlumnus = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
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
        values.push(req.body[bodyKey]);
        fields.push(`${columnKey} = $${values.length}`);
      }
    });

    if (!fields.length) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    values.push(id);
    const query = `UPDATE alumni SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Alumnus not found" });
    }

    res.json({ data: formatAlumniRow(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating alumnus" });
  }
};

export const deleteAlumnus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM alumni WHERE id = $1 RETURNING id", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Alumnus not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting alumnus" });
  }
};
