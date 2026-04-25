import { pool } from "../config/db.js";

const formatJobReferral = (row) => ({
  id: row.id,
  alumniId: row.alumni_id,
  jobTitle: row.job_title,
  company: row.company,
  description: row.description,
  location: row.location,
  jobLink: row.job_link,
  createdAt: row.created_at,
  alumniName: row.alumni_name ?? row.alumniName,
  hasApplied: Boolean(row.has_applied)
});

const formatJobApplication = (row) => ({
  id: row.id,
  studentId: row.student_id,
  jobReferralId: row.job_referral_id,
  status: row.status,
  createdAt: row.applied_at,
  jobTitle: row.job_title,
  company: row.company,
  location: row.location,
  jobLink: row.job_link,
  description: row.description,
  alumniName: row.alumni_name
});

export const getJobReferrals = async (req, res) => {
  try {
    const rawStudent = req.query.studentId;
    const studentId = rawStudent !== undefined && rawStudent !== "" ? Number(rawStudent) : null;
    const withApplied =
      studentId !== null && Number.isInteger(studentId) && studentId > 0
        ? `EXISTS (
            SELECT 1 FROM job_applications ja
            WHERE ja.job_referral_id = j.id AND ja.student_id = $1
          ) AS has_applied`
        : `FALSE AS has_applied`;

    const params = withApplied.includes("$1") ? [studentId] : [];

    const result = await pool.query(
      `SELECT j.id, j.alumni_id, j.job_title, j.company, j.description, j.location, j.job_link, j.created_at,
              a.name AS alumni_name,
              ${withApplied}
       FROM job_referrals j
       JOIN alumni a ON j.alumni_id = a.id
       ORDER BY j.created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows.map(formatJobReferral) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getJobApplicationsForStudent = async (req, res) => {
  try {
    const sid = req.user.role === 'admin' && req.params.studentId 
      ? Number(req.params.studentId) 
      : req.user.id;
      
    if (!Number.isInteger(sid) || sid < 1) {
      return res.status(400).json({ success: false, message: "Invalid student id" });
    }

    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND LOWER(role) = 'student'`,
      [sid]
    );
    if (!userCheck.rows.length) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    const result = await pool.query(
      `SELECT ja.id, ja.student_id, ja.job_referral_id, ja.status, ja.applied_at,
              j.job_title, j.company, j.description, j.location, j.job_link,
              a.name AS alumni_name
       FROM job_applications ja
       JOIN job_referrals j ON j.id = ja.job_referral_id
       JOIN alumni a ON a.id = j.alumni_id
       WHERE ja.student_id = $1
       ORDER BY ja.applied_at DESC`,
      [sid]
    );
    res.json({ success: true, data: result.rows.map(formatJobApplication) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createJobApplication = async (req, res) => {
  try {
    const { job_referral_id } = req.body;
    const student_id = req.user.id;

    if (job_referral_id == null) {
      return res.status(400).json({ success: false, message: "job_referral_id is required" });
    }

    const sid = Number(student_id);
    if (!Number.isInteger(sid) || sid < 1) {
      return res.status(400).json({ success: false, message: "Invalid student_id" });
    }

    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND LOWER(role) = 'student'`,
      [sid]
    );
    if (!userCheck.rows.length) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    const refCheck = await pool.query(`SELECT id FROM job_referrals WHERE id = $1`, [job_referral_id]);
    if (!refCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Job referral not found" });
    }

    const result = await pool.query(
      `INSERT INTO job_applications (student_id, job_referral_id, status)
       VALUES ($1, $2, 'Applied')
       ON CONFLICT (student_id, job_referral_id)
       DO UPDATE SET status = 'Applied'
       RETURNING id, student_id, job_referral_id, status, applied_at`,
      [sid, job_referral_id]
    );

    const row = result.rows[0];
    const detail = await pool.query(
      `SELECT ja.id, ja.student_id, ja.job_referral_id, ja.status, ja.applied_at,
              j.job_title, j.company, j.description, j.location, j.job_link,
              a.name AS alumni_name
       FROM job_applications ja
       JOIN job_referrals j ON j.id = ja.job_referral_id
       JOIN alumni a ON a.id = j.alumni_id
       WHERE ja.id = $1`,
      [row.id]
    );

    console.log({
      user: req.user.id,
      action: "Applied for job",
      job_referral_id
    });

    res.status(201).json({ success: true, data: formatJobApplication(detail.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createJobReferral = async (req, res) => {
  try {
    const { job_title, company, description, location, job_link } = req.body;
    const alumni_id = req.user.id;

    if (!job_title || !String(job_title).trim()) {
      return res.status(400).json({ success: false, message: "job_title is required" });
    }

    const exists = await pool.query(`SELECT id FROM alumni WHERE id = $1`, [alumni_id]);
    if (!exists.rows.length) {
      return res.status(400).json({ success: false, message: "Invalid alumni_id" });
    }

    const nameRes = await pool.query(`SELECT name FROM alumni WHERE id = $1`, [alumni_id]);
    const alumniName = nameRes.rows[0]?.name || null;

    const result = await pool.query(
      `INSERT INTO job_referrals (alumni_id, job_title, company, description, location, job_link, posted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, alumni_id, job_title, company, description, location, job_link, posted_by, created_at`,
      [
        alumni_id,
        String(job_title).trim(),
        company?.trim() || null,
        description?.trim() || null,
        location?.trim() || null,
        job_link?.trim() || null,
        alumniName
      ]
    );

    const row = result.rows[0];
    row.alumni_name = alumniName;

    console.log({
      user: req.user.id,
      action: "Created job referral",
      job_referral_id: row.id
    });

    res.status(201).json({ success: true, data: formatJobReferral(row) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAdminJobReferrals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.id, j.alumni_id, j.job_title, j.company, j.description, j.location, j.job_link, j.posted_by, j.status, j.is_flagged, j.created_at,
              a.name AS alumni_name
       FROM job_referrals j
       JOIN alumni a ON j.alumni_id = a.id
       ORDER BY j.created_at DESC`
    );
    res.json({ success: true, data: result.rows.map(row => ({
      id: row.id,
      alumniId: row.alumni_id,
      alumniName: row.alumni_name,
      jobTitle: row.job_title,
      company: row.company,
      description: row.description,
      location: row.location,
      jobLink: row.job_link,
      postedBy: row.posted_by,
      status: row.status,
      isFlagged: row.is_flagged,
      createdAt: row.created_at
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateJobReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isFlagged } = req.body;

    if (status && !['Active', 'Archived'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const fields = [];
    const values = [];

    if (status !== undefined) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(status);
    }

    if (isFlagged !== undefined) {
      fields.push(`is_flagged = $${fields.length + 1}`);
      values.push(Boolean(isFlagged));
    }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE job_referrals SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, alumni_id, job_title, company, description, location, job_link, posted_by, status, is_flagged, created_at`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Job referral not found" });
    }

    const row = result.rows[0];
    const nameRes = await pool.query(`SELECT name FROM alumni WHERE id = $1`, [row.alumni_id]);
    
    res.json({ success: true, data: {
      id: row.id,
      alumniId: row.alumni_id,
      alumniName: nameRes.rows[0]?.name || null,
      jobTitle: row.job_title,
      company: row.company,
      description: row.description,
      location: row.location,
      jobLink: row.job_link,
      postedBy: row.posted_by,
      status: row.status,
      isFlagged: row.is_flagged,
      createdAt: row.created_at
    } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, company, posted_by AS "postedBy", created_at AS "createdAt"
       FROM jobs ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, company, postedBy } = req.body;

    if (!title || !company || !postedBy) {
      return res.status(400).json({ success: false, message: "Title, company, and postedBy are required" });
    }

    const result = await pool.query(
      `INSERT INTO jobs (title, company, posted_by)
       VALUES ($1, $2, $3)
       RETURNING id, title, company, posted_by AS "postedBy", created_at AS "createdAt"`,
      [title, company, postedBy]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      ["title", "title"],
      ["company", "company"],
      ["postedBy", "posted_by"]
    ];
    const fields = [];
    const values = [];

    allowedFields.forEach(([bodyKey, columnKey]) => {
      if (req.body[bodyKey] !== undefined) {
        values.push(req.body[bodyKey]);
        fields.push(`${columnKey} = $${values.length}`);
      }
    });

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields provided for update" });
    }

    values.push(id);
    const query = `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, title, company, posted_by AS "postedBy", created_at AS "createdAt"`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING id", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
