import { pool } from "../config/db.js";

export const getPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, author, title, description, category, link_url AS "linkUrl", tags, visibility, created_at AS "createdAt", likes
       FROM posts ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, linkUrl = "", tags = [], visibility = "Everyone" } = req.body;
    const author = req.user.name || req.body.author;

    if (!author || !title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Post author and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO posts (author, title, description, category, link_url, tags, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, author, title, description, category, link_url AS "linkUrl", tags, visibility, created_at AS "createdAt", likes`,
      [author, String(title).trim(), description, category, linkUrl, tags, visibility]
    );

    console.log({
      user: req.user.id,
      action: "Created post",
      post_id: result.rows[0].id
    });

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
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
    const query = `UPDATE posts SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, author, title, description, category, link_url AS "linkUrl", tags, visibility, created_at AS "createdAt", likes`;
    const result = await pool.query(query, values);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPostsByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    const result = await pool.query(
      `SELECT id, author, title, description, category, link_url AS "linkUrl", tags, visibility, created_at AS "createdAt", likes
       FROM posts WHERE author = $1 ORDER BY created_at DESC LIMIT 3`,
      [author]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
