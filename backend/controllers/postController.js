import { pool } from "../config/db.js";
import { logger } from "../utils/logger.js";

export const getPosts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT p.id, p.author, p.title, p.description, p.category, p.link_url AS "linkUrl", p.image_data AS "imageData", p.tags, p.visibility, p.created_at AS "createdAt", p.likes,
       EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) AS "isLikedByMe"
       FROM posts p ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in postController.js");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, linkUrl = "", image = null, tags = [], visibility = "Everyone" } = req.body;
    const author = req.user.name || req.body.author;

    if (!author || !title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Post author and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO posts (author, title, description, category, link_url, image_data, tags, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, author, title, description, category, link_url AS "linkUrl", image_data AS "imageData", tags, visibility, created_at AS "createdAt", likes`,
      [author, String(title).trim(), description, category, linkUrl, image, tags, visibility]
    );

    logger.info({
      user: req.user.id,
      action: "Created post",
      post_id: result.rows[0].id
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in postController.js");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      ["author", "author"],
      ["title", "title"],
      ["description", "description"],
      ["category", "category"],
      ["linkUrl", "link_url"],
      ["imageData", "image_data"],
      ["tags", "tags"],
      ["visibility", "visibility"],
      ["likes", "likes"]
    ];
    const fields = [];
    const values = [];

    allowedFields.forEach(([bodyKey, columnKey]) => {
      if (req.body[bodyKey] !== undefined) {
        values.push(req.body[bodyKey]);
        fields.push(`${columnKey} = $${values.length}`);
      }
    });

    if (!fields.length) {
      return res.status(400).json({ success: false, message: "No fields provided for update" });
    }

    values.push(id);
    const query = `UPDATE posts SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, author, title, description, category, link_url AS "linkUrl", image_data AS "imageData", tags, visibility, created_at AS "createdAt", likes`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in postController.js");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPostsByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT p.id, p.author, p.title, p.description, p.category, p.link_url AS "linkUrl", p.image_data AS "imageData", p.tags, p.visibility, p.created_at AS "createdAt", p.likes,
       EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) AS "isLikedByMe"
       FROM posts p WHERE p.author = $2 ORDER BY p.created_at DESC LIMIT 3`,
      [userId, author]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in postController.js");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING id",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "Error in postController.js");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleLikePost = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Check if like exists
    const likeCheck = await client.query(
      "SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (likeCheck.rows.length > 0) {
      // User already liked it, so unlike
      await client.query("DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2", [id, userId]);
      await client.query("UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1", [id]);
      
      await client.query('COMMIT');
      return res.json({ success: true, message: "Post unliked successfully", isLikedByMe: false });
    } else {
      // User hasn't liked it, so like
      await client.query("INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)", [id, userId]);
      await client.query("UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1", [id]);
      
      logger.info({ user: userId, action: "Liked post", post_id: id });
      
      await client.query('COMMIT');
      return res.json({ success: true, message: "Post liked successfully", isLikedByMe: true });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error: error.message, stack: error.stack }, "Error in toggleLikePost");
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
};
