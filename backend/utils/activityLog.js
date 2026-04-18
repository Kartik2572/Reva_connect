import { pool } from "../config/db.js";

export async function logAdminActivity(adminName, action) {
  await pool.query("INSERT INTO activity_logs (admin_name, action) VALUES ($1, $2)", [
    adminName,
    action
  ]);
}
