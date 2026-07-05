import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { logger } from "../utils/logger.js";
import { sendOtpEmail } from "../utils/mailer.js";

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
        `INSERT INTO alumni (user_id, name, role, company, branch_or_company, graduation_year, experience, domain, location, status, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', 'Pending')
         RETURNING id`,
        [result.rows[0].id, name, role, companyTrimmed, branch || null, graduationYear || null, experience || null, domain || null, location || null]
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
    logger.error({ error: error.message, stack: error.stack }, "Register error");
    
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

    let alumniId = null;
    if (user.role && String(user.role).toLowerCase() === "alumni") {
      const al = await pool.query(
        `SELECT id, verification_status FROM alumni WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      
      const alumniData = al.rows[0];
      if (alumniData) {
        if (alumniData.verification_status === "Pending") {
          return res.status(403).json({
            success: false,
            message: "Your alumni account is pending admin verification"
          });
        }
        if (alumniData.verification_status === "Rejected") {
          return res.status(403).json({
            success: false,
            message: "Your alumni account has been rejected"
          });
        }
        alumniId = alumniData.id;
      }
    }

    const token = generateToken(user);

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
    logger.error({ error: error.message, stack: error.stack }, "Login error");
    
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
    const { name, email, branch } = req.body;

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

    if (branch !== undefined && branch.trim()) {
      fields.push(`branch = $${fields.length + 1}`);
      values.push(branch.trim());
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

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error updating user profile");
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate fields presence
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Confirm password matches
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password does not match new password."
      });
    }

    // New password must differ from current password
    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must differ from current password."
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter."
      });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter."
      });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number."
      });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character."
      });
    }

    // Fetch stored hash
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const storedHash = result.rows[0].password;

    // Compare stored hash
    const isMatch = await bcrypt.compare(currentPassword, storedHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedNewPassword, userId]
    );

    return res.json({
      success: true,
      message: "Password changed successfully. Please login again."
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error changing password");
    return res.status(500).json({
      success: false,
      message: "Error changing password."
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Generic response message
    const genericResponse = {
      success: true,
      message: "If that email is registered, we have sent an OTP."
    };

    // 1. Verify email exists in DB
    const userResult = await pool.query(
      "SELECT id, reset_otp_expiry FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Return generic response even if email doesn't exist
      return res.json(genericResponse);
    }

    const user = userResult.rows[0];

    // Limit resend frequency to 60 seconds
    if (user.reset_otp_expiry) {
      const sentAt = new Date(user.reset_otp_expiry).getTime() - 10 * 60 * 1000;
      const now = Date.now();
      if (now - sentAt < 60 * 1000) {
        return res.status(429).json({
          success: false,
          message: "Please wait 60 seconds before requesting another OTP."
        });
      }
    }

    // 2. Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Hash OTP using bcrypt
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 4. Save hashed OTP and expiry in DB, and reset attempts to 0 and otp_verified to false
    await pool.query(
      `UPDATE users 
       SET reset_otp = $1, reset_otp_expiry = $2, otp_verified = false, reset_otp_attempts = 0 
       WHERE id = $3`,
      [hashedOtp, expiry, user.id]
    );

    // 5. Send OTP via Nodemailer or log fallback
    await sendOtpEmail(email, otp);

    return res.json(genericResponse);
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in forgotPassword");
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ success: false, message: "OTP must be exactly 6 digits." });
    }

    // 1. Fetch user by email
    const result = await pool.query(
      `SELECT id, reset_otp, reset_otp_expiry, reset_otp_attempts 
       FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or OTP." });
    }

    const user = result.rows[0];

    // 2. Check if OTP exists
    if (!user.reset_otp || !user.reset_otp_expiry) {
      return res.status(400).json({ success: false, message: "No active OTP found for this email." });
    }

    // 3. Limit OTP attempts (max 5)
    if (user.reset_otp_attempts >= 5) {
      // Invalidate OTP immediately
      await pool.query(
        `UPDATE users 
         SET reset_otp = null, reset_otp_expiry = null, reset_otp_attempts = 0, otp_verified = false 
         WHERE id = $1`,
        [user.id]
      );
      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP."
      });
    }

    // 4. Check expiration (10 minutes)
    if (new Date() > new Date(user.reset_otp_expiry)) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // 5. Compare input OTP with stored hashed OTP
    const isMatch = await bcrypt.compare(otp, user.reset_otp);
    if (!isMatch) {
      // Increment attempts
      await pool.query(
        `UPDATE users SET reset_otp_attempts = reset_otp_attempts + 1 WHERE id = $1`,
        [user.id]
      );
      
      const attemptsRemaining = 5 - (user.reset_otp_attempts + 1);
      if (attemptsRemaining <= 0) {
        // Clear immediately
        await pool.query(
          `UPDATE users 
           SET reset_otp = null, reset_otp_expiry = null, reset_otp_attempts = 0, otp_verified = false 
           WHERE id = $1`,
          [user.id]
        );
        return res.status(400).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP."
        });
      }
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${attemptsRemaining} attempts remaining.`
      });
    }

    // 6. OTP is correct and valid: set otp_verified = true, reset attempts to 0
    await pool.query(
      `UPDATE users 
       SET otp_verified = true, reset_otp_attempts = 0 
       WHERE id = $1`,
      [user.id]
    );

    return res.json({
      success: true,
      message: "OTP verified successfully."
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in verifyOtp");
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // 1. Fetch user by email
    const result = await pool.query(
      `SELECT id, otp_verified FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    const user = result.rows[0];

    // 2. Require otp_verified == true
    if (!user.otp_verified) {
      return res.status(403).json({ success: false, message: "OTP verification required." });
    }

    // 3. Confirm passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Confirm password does not match new password." });
    }

    // 4. Password complexity validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter."
      });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter."
      });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number."
      });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character."
      });
    }

    // 5. Hash password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // 6. Update user password and clear OTP fields
    await pool.query(
      `UPDATE users 
       SET password = $1, reset_otp = null, reset_otp_expiry = null, otp_verified = false, reset_otp_attempts = 0, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedNewPassword, user.id]
    );

    return res.json({
      success: true,
      message: "Password reset successfully. Please login again."
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in resetPassword");
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

