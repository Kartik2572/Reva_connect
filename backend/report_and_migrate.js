import { pool } from "./config/db.js";
import fs from "fs";

async function run() {
  const client = await pool.connect();
  try {
    console.log("Starting Data Preparation and Reporting...");

    await client.query("BEGIN");

    // 1. Remove duplicate job_applications
    console.log("Removing duplicate job applications...");
    const resJobs = await client.query(`
      DELETE FROM job_applications a 
      USING job_applications b 
      WHERE a.id > b.id 
        AND a.student_id = b.student_id 
        AND a.job_referral_id = b.job_referral_id
      RETURNING a.id;
    `);
    console.log(`Deleted ${resJobs.rowCount} duplicate job applications.`);

    // 2. Remove duplicate event_registrations
    console.log("Removing duplicate event registrations...");
    const resEvents = await client.query(`
      DELETE FROM event_registrations a 
      USING event_registrations b 
      WHERE a.id > b.id 
        AND a.user_id = b.user_id 
        AND a.event_id = b.event_id
      RETURNING a.id;
    `);
    console.log(`Deleted ${resEvents.rowCount} duplicate event registrations.`);

    // 3. Add UNIQUE constraints
    console.log("Adding UNIQUE constraints...");
    await client.query(`ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS unique_application;`);
    await client.query(`ALTER TABLE job_applications ADD CONSTRAINT unique_application UNIQUE(student_id, job_referral_id);`);
    await client.query(`ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS unique_event_registration;`);
    await client.query(`ALTER TABLE event_registrations ADD CONSTRAINT unique_event_registration UNIQUE(user_id, event_id);`);

    // 4. Generate Alumni <-> Users mapping report
    console.log("Generating Alumni Mapping Report...");
    
    // Matched mappings
    const matched = await client.query(`
      SELECT a.id as alumni_id, a.name as alumni_name, u.id as user_id, u.name as user_name 
      FROM alumni a 
      JOIN users u ON LOWER(TRIM(u.name)) = LOWER(TRIM(a.name))
    `);

    // Unmatched alumni
    const unmatched = await client.query(`
      SELECT a.id as alumni_id, a.name as alumni_name 
      FROM alumni a 
      LEFT JOIN users u ON LOWER(TRIM(u.name)) = LOWER(TRIM(a.name))
      WHERE u.id IS NULL
    `);

    // Users with same name (potential duplicates in mapping)
    const duplicateUsers = await client.query(`
      SELECT LOWER(TRIM(name)) as name, COUNT(*) 
      FROM users 
      WHERE role = 'alumni' 
      GROUP BY LOWER(TRIM(name)) 
      HAVING COUNT(*) > 1
    `);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        matchedCount: matched.rowCount,
        unmatchedCount: unmatched.rowCount,
        duplicateUserNamesCount: duplicateUsers.rowCount,
      },
      unmatchedAlumni: unmatched.rows,
      duplicateUserNames: duplicateUsers.rows,
      // matched: matched.rows // Omitted from text output to save space, but tracked
    };

    fs.writeFileSync("alumni_mapping_report.json", JSON.stringify(report, null, 2));
    console.log("Report saved to alumni_mapping_report.json");

    // 5. Add user_id column and update it
    console.log("Adding user_id to alumni table...");
    await client.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS user_id INTEGER;`);
    const updateRes = await client.query(`
      UPDATE alumni a 
      SET user_id = u.id 
      FROM users u 
      WHERE LOWER(TRIM(u.name)) = LOWER(TRIM(a.name));
    `);
    console.log(`Updated ${updateRes.rowCount} alumni records with user_id.`);

    await client.query("COMMIT");
    console.log("Transaction Committed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during migration, transaction rolled back.", error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
