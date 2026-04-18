import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

const SALT_ROUNDS = 10;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, branch, graduationYear, experience, domain, location, company } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required"
      });
    }

    if (!["student", "alumni", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student, alumni, or admin"
      });
    }

    if (["student", "alumni"].includes(role) && !branch?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Branch is required for student and alumni roles"
      });
    }

    if (role === "alumni") {
      if (!company || !String(company).trim()) {
        return res.status(400).json({
          success: false,
          message: "Company name is required for alumni"
        });
      }

      if (!graduationYear || !String(graduationYear).trim()) {
        return res.status(400).json({
          success: false,
          message: "Graduation year is required for alumni"
        });
      }

      const year = Number(graduationYear);
      if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 5) {
        return res.status(400).json({
          success: false,
          message: "Graduation year is invalid"
        });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, branch)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, branch, created_at`,
      [name, email, hashedPassword, role, branch || null]
    );

    let alumniId = null;
    if (role === "alumni") {
      const companyTrimmed = String(company).trim();
      const alumniInsert = await pool.query(
        `INSERT INTO alumni (name, role, company, branch_or_company, graduation_year, experience, domain, location, status, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', 'Pending')
         RETURNING id`,
        [name, role, companyTrimmed, branch || null, graduationYear || null, experience || null, domain || null, location || null]
      );
      alumniId = alumniInsert.rows[0]?.id || null;
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        ...result.rows[0],
        ...(alumniId ? { alumniId } : {})
      }
    });
  } catch (error) {
    console.error("Register error:", error.message);
    
    // Handle specific database errors
    if (error.code === "42P01") {
      return res.status(500).json({
        success: false,
        message: "Database table does not exist. Please run schema.sql to initialize the database."
      });
    }
    
    if (error.code === "ECONNREFUSED" || error.message.includes("connect")) {
      return res.status(500).json({
        success: false,
        message: "Cannot connect to database. Ensure PostgreSQL is running."
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Error registering user"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const result = await pool.query(
      "SELECT id, name, email, password, role, branch FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    let alumniId = null;
    if (user.role && String(user.role).toLowerCase() === "alumni") {
      const al = await pool.query(
        `SELECT id FROM alumni WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1`,
        [user.name]
      );
      alumniId = al.rows[0]?.id || null;
    }

    // Return user without password and include JWT
    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch || null,
        alumniId
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return res.status(500).json({
        success: false,
        message: "Database table does not exist. Please run schema.sql to initialize the database."
      });
    }
    
    if (error.code === "ECONNREFUSED" || error.message.includes("connect")) {
      return res.status(500).json({
        success: false,
        message: "Cannot connect to database. Ensure PostgreSQL is running."
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Error logging in"
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fields = [];
    const values = [];

    if (name !== undefined && name.trim()) {
      fields.push(`name = $${fields.length + 1}`);
      values.push(name.trim());
    }

    if (email !== undefined && email.trim()) {
      fields.push(`email = $${fields.length + 1}`);
      values.push(email.trim());
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING id, name, email, role, branch`;

    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
