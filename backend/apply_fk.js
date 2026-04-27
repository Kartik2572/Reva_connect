import { pool } from "./config/db.js";

async function run() {
  const client = await pool.connect();
  try {
    console.log("Applying FK constraint...");
    await client.query("BEGIN");

    // Foreign Key constraint
    await client.query(`ALTER TABLE alumni DROP CONSTRAINT IF EXISTS fk_alumni_user;`);
    await client.query(`ALTER TABLE alumni ADD CONSTRAINT fk_alumni_user FOREIGN KEY (user_id) REFERENCES users(id);`);

    await client.query("COMMIT");
    console.log("Constraint applied successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error applying constraint", error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
