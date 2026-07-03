import { pool } from "./config/db.js";

async function run() {
  try {
    console.log("Running migration to add linkedin_profile column to alumni...");
    await pool.query(`
      ALTER TABLE alumni ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
    `);
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

run();
