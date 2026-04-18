import { pool } from "../config/db.js";
import { logAdminActivity } from "../utils/activityLog.js";

export const getAdminStats = async (req, res) => {
  try {
    const [studentsRes, alumniRes, mentorshipRes, jobsRes, eventsRes, popularEventRes, mostActiveAlumniRes, mostRequestedMentorRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE LOWER(role) = $1", ["student"]),
      pool.query("SELECT COUNT(*) FROM users WHERE LOWER(role) = $1", ["alumni"]),
      pool.query("SELECT COUNT(*) FROM mentorship_requests"),
      pool.query("SELECT COUNT(*) FROM jobs"),
      pool.query("SELECT COUNT(*) FROM events"),
      pool.query("SELECT title FROM events ORDER BY registered_students DESC NULLS LAST LIMIT 1"),
      pool.query("SELECT name FROM alumni ORDER BY experience DESC NULLS LAST LIMIT 1"),
      pool.query(
        "SELECT u.name FROM mentorship_requests m JOIN users u ON u.id = m.mentor_id GROUP BY u.name ORDER BY COUNT(*) DESC LIMIT 1"
      )
    ]);

    return res.json({
      data: {
        totalStudents: Number(studentsRes.rows[0].count),
        totalAlumni: Number(alumniRes.rows[0].count),
        totalMentorshipRequests: Number(mentorshipRes.rows[0].count),
        totalJobReferrals: Number(jobsRes.rows[0].count),
        totalEvents: Number(eventsRes.rows[0].count),
        analytics: {
          mostActiveAlumni: mostActiveAlumniRes.rows[0]?.name || null,
          mostRequestedMentor: mostRequestedMentorRes.rows[0]?.name || null,
          mostPopularEvent: popularEventRes.rows[0]?.title || null
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admin stats" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, branch, created_at AS "createdAt"
       FROM users ORDER BY name`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    if (error.code === "28P01") {
      return res.status(500).json({
        message: "Database authentication failed. Check DB_USER and DB_PASSWORD in backend/.env."
      });
    }
    res.status(500).json({ message: error.message || "Error fetching users" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName = "Admin" } = req.body;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletedUser = result.rows[0];
    if (deletedUser.role === "alumni") {
      await pool.query(
        "DELETE FROM alumni WHERE name = $1 AND role = 'alumni'",
        [deletedUser.name]
      );
    }

    await logAdminActivity(adminName, `Admin ${adminName} deleted user ${deletedUser.name} (${deletedUser.role})`);
    res.json({ success: true, data: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const getPendingAlumni = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"
       FROM alumni WHERE status = 'Pending' ORDER BY name`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending alumni" });
  }
};

export const updatePendingAlumniStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = "approve", adminName = "Admin" } = req.body;
    const status = action === "reject" ? "Rejected" : "Approved";
    const verificationStatus = status;

    const result = await pool.query(
      `UPDATE alumni SET status = $1, verification_status = $2 WHERE id = $3 RETURNING id, name, role, company, branch_or_company AS "branchOrCompany", graduation_year AS "graduationYear", experience, domain, location, status, verification_status AS "verificationStatus"`,
      [status, verificationStatus, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Pending alumni not found" });
    }

    await logAdminActivity(adminName, `Admin ${adminName} ${action === "reject" ? "rejected" : "approved"} alumni ${result.rows[0].name}`);
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating alumni verification status" });
  }
};

export const getAdminPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, author, title, description, category, link_url AS "linkUrl", tags, visibility, created_at AS "createdAt", likes
       FROM posts ORDER BY created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, host, date, time, mode, registered_students AS \"registeredStudents\" FROM events ORDER BY date DESC"
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

export const getAdminActivityLogs = async (req, res) => {
  try {
    const raw = req.query.limit;
    const params = [];
    let limitSql = "";
    if (raw !== undefined && raw !== "") {
      const n = Math.min(Math.max(parseInt(String(raw), 10) || 0, 1), 500);
      params.push(n);
      limitSql = `LIMIT $${params.length}`;
    }
    const result = await pool.query(
      `SELECT id, admin_name AS "adminName", action, created_at AS "createdAt"
       FROM activity_logs ORDER BY created_at DESC ${limitSql}`,
      params
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching activity logs" });
  }
};

export const createAdminActivityLog = async (req, res) => {
  try {
    const { adminName = "Admin", action } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Action message is required" });
    }

    await logAdminActivity(adminName, action);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating activity log" });
  }
};

export const deleteAdminPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName = "Admin" } = req.body;
    const result = await pool.query(`DELETE FROM posts WHERE id = $1 RETURNING author, title`, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { author, title } = result.rows[0];
    await logAdminActivity(
      adminName,
      `Admin ${adminName} deleted post "${title || "untitled"}" by ${author}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// Analytics endpoints for charts
export const getUserRegistrationTrends = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    const data = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: Number(row.count)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user registration trends" });
  }
};

export const getAlumniByGraduationYear = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        graduation_year AS year,
        COUNT(*) AS count
      FROM alumni
      WHERE graduation_year IS NOT NULL
      GROUP BY graduation_year
      ORDER BY graduation_year DESC
    `);

    const data = result.rows.map(row => ({
      year: row.year.toString(),
      count: Number(row.count)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching alumni graduation year data" });
  }
};

export const getAlumniByCompany = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(company, 'Not Specified') AS name,
        COUNT(*) AS value
      FROM alumni
      GROUP BY company
      ORDER BY value DESC
      LIMIT 10
    `);

    const data = result.rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching alumni company data" });
  }
};

export const getAlumniByDomain = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(domain, 'Not Specified') AS name,
        COUNT(*) AS value
      FROM alumni
      GROUP BY domain
      ORDER BY value DESC
      LIMIT 10
    `);

    const data = result.rows.map(row => ({
      name: row.name,
      value: Number(row.value)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching alumni domain data" });
  }
};

export const getEventRegistrationTrends = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', er.registered_at) AS month,
        COUNT(*) AS registrations
      FROM event_registrations er
      WHERE er.registered_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', er.registered_at)
      ORDER BY month
    `);

    const data = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      registrations: Number(row.registrations)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event registration trends" });
  }
};

export const getUserRoleDistribution = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        role,
        COUNT(*) AS count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      name: row.role.charAt(0).toUpperCase() + row.role.slice(1),
      value: Number(row.count)
    }));

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user role distribution" });
  }
};

export const getEventStats = async (req, res) => {
  try {
    const [totalEvents, upcomingEvents, pastEvents, totalRegistrations] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM events"),
      pool.query("SELECT COUNT(*) FROM events WHERE date >= CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM events WHERE date < CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM event_registrations")
    ]);

    res.json({
      data: {
        totalEvents: Number(totalEvents.rows[0].count),
        upcomingEvents: Number(upcomingEvents.rows[0].count),
        pastEvents: Number(pastEvents.rows[0].count),
        totalRegistrations: Number(totalRegistrations.rows[0].count)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event stats" });
  }
};