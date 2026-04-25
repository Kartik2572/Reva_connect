import { pool } from "../config/db.js";

const ALLOWED_STATUS = new Set(["Pending", "Accepted", "Rejected"]);

const normalizeStatus = (status) => {
  if (!status || typeof status !== "string") return null;
  const s = status.trim();
  if (s === "Approved") return "Accepted";
  if (ALLOWED_STATUS.has(s)) return s;
  return null;
};

export const createMentorshipRequest = async (req, res) => {
  try {
    const { mentorId } = req.body;
    const studentId = req.user.id;

    if (mentorId == null) {
      return res.status(400).json({ success: false, message: "mentorId is required" });
    }

    const sid = Number(studentId);
    if (!Number.isInteger(sid) || sid < 1) {
      return res.status(400).json({ success: false, message: "studentId must be a valid user id" });
    }

    const studentCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND LOWER(role) = 'student'`,
      [sid]
    );
    if (!studentCheck.rows.length) {
      return res.status(400).json({ success: false, message: "Student not found" });
    }

    const mentorCheck = await pool.query(`SELECT id FROM alumni WHERE id = $1`, [mentorId]);
    if (!mentorCheck.rows.length) {
      return res.status(400).json({ success: false, message: "Mentor not found" });
    }

    const result = await pool.query(
      `INSERT INTO mentorship_requests (student_id, mentor_id, status)
       VALUES ($1, $2, $3)
       RETURNING id, student_id AS "studentId", mentor_id AS "mentorId", status, created_at AS "createdAt"`,
      [sid, mentorId, "Pending"]
    );

    console.log({
      user: req.user.id,
      action: "Created mentorship request",
      mentor_id: mentorId
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMentorshipRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.student_id AS "studentId", m.mentor_id AS "mentorId", m.status, m.created_at AS "createdAt",
              u.name AS "studentName", u.email AS "studentEmail",
              a.name AS "mentorName", a.company AS "mentorCompany"
       FROM mentorship_requests m
       JOIN users u ON u.id = m.student_id
       JOIN alumni a ON a.id = m.mentor_id
       ORDER BY m.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMentorshipRequestsForStudent = async (req, res) => {
  try {
    const sid = req.user.role === 'admin' && req.params.studentId 
      ? Number(req.params.studentId) 
      : req.user.id;
      
    if (!Number.isInteger(sid)) {
      return res.status(400).json({ success: false, message: "Invalid student id" });
    }

    const result = await pool.query(
      `SELECT m.id, m.student_id AS "studentId", m.mentor_id AS "mentorId", m.status, m.created_at AS "createdAt",
              a.name AS "mentorName", a.company AS "mentorCompany", a.domain AS "mentorDomain"
       FROM mentorship_requests m
       JOIN alumni a ON a.id = m.mentor_id
       WHERE m.student_id = $1
       ORDER BY m.created_at DESC`,
      [sid]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMentorshipRequestsForAlumnus = async (req, res) => {
  try {
    const { alumnusId } = req.params;
    const result = await pool.query(
      `SELECT m.id, m.student_id AS "studentId", m.mentor_id AS "mentorId", m.status, m.created_at AS "createdAt",
              u.name AS "studentName", u.email AS "studentEmail", u.branch AS "studentBranch"
       FROM mentorship_requests m
       JOIN users u ON u.id = m.student_id
       WHERE m.mentor_id = $1
       ORDER BY m.created_at DESC`,
      [alumnusId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mentorId = req.user.id;
    const normalized = normalizeStatus(status);

    if (!normalized) {
      return res.status(400).json({ success: false, message: "Status must be Pending, Accepted, or Rejected" });
    }

    const existing = await pool.query(
      `SELECT id, mentor_id AS "mentorId" FROM mentorship_requests WHERE id = $1`,
      [id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (req.user.role !== 'admin' && String(existing.rows[0].mentorId) !== String(mentorId)) {
      return res.status(403).json({ success: false, message: "Not allowed to update this request" });
    }

    const result = await pool.query(
      `UPDATE mentorship_requests SET status = $1 WHERE id = $2
       RETURNING id, student_id AS "studentId", mentor_id AS "mentorId", status, created_at AS "createdAt"`,
      [normalized, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM mentorship_requests WHERE id = $1 RETURNING id", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, message: "Mentorship request deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
