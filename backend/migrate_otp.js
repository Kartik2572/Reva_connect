import { pool } from "./config/db.js";

async function run() {
  try {
    console.log("Running migration to add OTP columns to users...");
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS reset_otp TEXT,
      ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reset_otp_attempts INTEGER DEFAULT 0;
    `);
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

run();
