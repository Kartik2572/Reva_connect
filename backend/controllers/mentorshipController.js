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
    const { studentId, mentorId } = req.body;

    if (studentId == null || mentorId == null) {
      return res.status(400).json({ message: "studentId and mentorId are required" });
    }

    const sid = Number(studentId);
    if (!Number.isInteger(sid) || sid < 1) {
      return res.status(400).json({ message: "studentId must be a valid user id" });
    }

    const studentCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND LOWER(role) = 'student'`,
      [sid]
    );
    if (!studentCheck.rows.length) {
      return res.status(400).json({ message: "Student not found" });
    }

    const mentorCheck = await pool.query(`SELECT id FROM alumni WHERE id = $1`, [mentorId]);
    if (!mentorCheck.rows.length) {
      return res.status(400).json({ message: "Mentor not found" });
    }

    const result = await pool.query(
      `INSERT INTO mentorship_requests (student_id, mentor_id, status)
       VALUES ($1, $2, $3)
       RETURNING id, student_id AS "studentId", mentor_id AS "mentorId", status, created_at AS "createdAt"`,
      [sid, mentorId, "Pending"]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating mentorship request" });
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
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching mentorship requests" });
  }
};

export const getMentorshipRequestsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const sid = Number(studentId);
    if (!Number.isInteger(sid)) {
      return res.status(400).json({ message: "Invalid student id" });
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
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching mentorship requests for student" });
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
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching mentorship requests for alumnus" });
  }
};

export const updateMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, mentorId } = req.body;
    const normalized = normalizeStatus(status);

    if (!normalized) {
      return res.status(400).json({ message: "Status must be Pending, Accepted, or Rejected" });
    }

    const existing = await pool.query(
      `SELECT id, mentor_id AS "mentorId" FROM mentorship_requests WHERE id = $1`,
      [id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (mentorId !== undefined && mentorId !== null && mentorId !== "") {
      if (String(existing.rows[0].mentorId) !== String(mentorId)) {
        return res.status(403).json({ message: "Not allowed to update this request" });
      }
    }

    const result = await pool.query(
      `UPDATE mentorship_requests SET status = $1 WHERE id = $2
       RETURNING id, student_id AS "studentId", mentor_id AS "mentorId", status, created_at AS "createdAt"`,
      [normalized, id]
    );

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating mentorship request" });
  }
};

export const deleteMentorshipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM mentorship_requests WHERE id = $1 RETURNING id", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting mentorship request" });
  }
};
