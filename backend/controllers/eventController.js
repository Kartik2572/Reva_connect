import { pool } from "../config/db.js";
import { logAdminActivity } from "../utils/activityLog.js";

const formatEvent = (row) => ({
  ...row,
  registeredStudents: row.registeredStudents,
  attachmentUrl: row.attachmentUrl
});

export const getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.host, e.date, e.time, e.mode, e.registered_students AS "registeredStudents", e.attachment_url AS "attachmentUrl",
       COUNT(er.id) AS registered_count
       FROM events e
       LEFT JOIN event_registrations er ON e.id = er.event_id
       GROUP BY e.id
       ORDER BY e.date DESC`
    );
    res.json({ data: result.rows.map(formatEvent) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

export const getEventsByHost = async (req, res) => {
  try {
    const { host } = req.params;
    const result = await pool.query(
      `SELECT id, title, description, host, date, time, mode, registered_students AS "registeredStudents", attachment_url AS "attachmentUrl"
       FROM events WHERE host = $1 ORDER BY date DESC`,
      [host]
    );
    res.json({ data: result.rows.map(formatEvent) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events by host" });
  }
};

/** Events whose host is an alumni user, excluding the named host (for "other alumni" tab). */
export const getOtherAlumniHostedEvents = async (req, res) => {
  try {
    const { host } = req.params;
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.host, e.date, e.time, e.mode, e.registered_students AS "registeredStudents", e.attachment_url AS "attachmentUrl",
       COUNT(er.id) AS registered_count
       FROM events e
       LEFT JOIN event_registrations er ON e.id = er.event_id
       INNER JOIN users u ON e.host = u.name AND LOWER(u.role) = 'alumni'
       WHERE e.host <> $1
       GROUP BY e.id
       ORDER BY e.date DESC`,
      [host]
    );
    res.json({ data: result.rows.map(formatEvent) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching other alumni events" });
  }
};

export const getUpcomingAlumniEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.host, e.date, e.time, e.mode, e.registered_students AS "registeredStudents", e.attachment_url AS "attachmentUrl",
       COUNT(er.id) AS registered_count
       FROM events e
       LEFT JOIN event_registrations er ON e.id = er.event_id
       JOIN users u ON e.host = u.name
       WHERE u.role = 'alumni' AND e.date >= CURRENT_DATE
       GROUP BY e.id
       ORDER BY e.date ASC`
    );
    res.json({ data: result.rows.map(formatEvent) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching upcoming alumni events" });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Validate user exists
    const userExists = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate event exists
    const eventExists = await pool.query(
      "SELECT id FROM events WHERE id = $1",
      [event_id]
    );

    if (eventExists.rows.length === 0) {
      return res.status(400).json({ message: "Event not found" });
    }

    // Check if already registered
    const existing = await pool.query(
      "SELECT id FROM event_registrations WHERE user_id = $1 AND event_id = $2",
      [user_id, event_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Insert registration
    await pool.query(
      "INSERT INTO event_registrations (user_id, event_id) VALUES ($1, $2)",
      [user_id, event_id]
    );

    // Update registered_students count
    await pool.query(
      "UPDATE events SET registered_students = registered_students + 1 WHERE id = $1",
      [event_id]
    );

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering for event" });
  }
};

export const getUserRegistrations = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: "Invalid authenticated user" });
    }

    const result = await pool.query(
      "SELECT event_id FROM event_registrations WHERE user_id = $1",
      [user_id]
    );

    res.json({ data: result.rows.map(row => row.event_id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user registrations" });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN event_registrations er ON u.id = er.user_id
       WHERE er.event_id = $1`,
      [id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event registrations" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, host, date, time, mode = "Online" } = req.body;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !date) {
      return res.status(400).json({ message: "Event title and date are required" });
    }

    const result = await pool.query(
      `INSERT INTO events (title, description, host, date, time, mode, registered_students, attachment_url)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7)
       RETURNING id, title, description, host, date, time, mode, registered_students AS "registeredStudents", attachment_url AS "attachmentUrl"`,
      [title, description, host, date, time, mode, attachmentUrl]
    );

    res.status(201).json({ data: formatEvent(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      ["title", "title"],
      ["description", "description"],
      ["host", "host"],
      ["date", "date"],
      ["time", "time"],
      ["mode", "mode"],
      ["registeredStudents", "registered_students"]
    ];
    const fields = [];
    const values = [];

    allowedFields.forEach(([bodyKey, column]) => {
      if (req.body[bodyKey] !== undefined) {
        values.push(req.body[bodyKey]);
        fields.push(`${column} = $${values.length}`);
      }
    });

    if (!fields.length) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    values.push(id);
    const query = `UPDATE events SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, title, description, host, date, time, mode, registered_students AS "registeredStudents"`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ data: formatEvent(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName } = req.body || {};
    const result = await pool.query("DELETE FROM events WHERE id = $1 RETURNING id, title", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (adminName) {
      const title = result.rows[0].title || "event";
      await logAdminActivity(adminName, `Admin ${adminName} deleted event "${title}"`);
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
