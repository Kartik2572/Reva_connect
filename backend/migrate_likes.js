import { pool } from "./config/db.js";

async function createPostLikesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      );
    `);
    console.log("✅ post_likes table created successfully (if it didn't exist).");
  } catch (error) {
    console.error("⚠️ Error creating post_likes table:", error);
  } finally {
    pool.end();
  }
}

createPostLikesTable();
