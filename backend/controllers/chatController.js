import { pool } from "../config/db.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT 
        c.id as conversation_id,
        c.last_message_at,
        c.created_at,
        u.id as other_user_id,
        u.name as other_user_name,
        u.role as other_user_role,
        (
          SELECT json_build_object(
            'id', m.id,
            'message', m.message,
            'sender_id', m.sender_id,
            'is_read', m.is_read,
            'created_at', m.created_at
          )
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT count(*) 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          AND m.sender_id != $1 
          AND m.is_read = FALSE
        ) as unread_count
      FROM conversations c
      JOIN users u ON (u.id = c.user1_id OR u.id = c.user2_id) AND u.id != $1
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.last_message_at DESC
    `, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is part of the conversation
    const convCheck = await pool.query(`
      SELECT * FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    if (convCheck.rowCount === 0) {
      return res.status(403).json({ success: false, message: "Access denied or conversation does not exist" });
    }

    const result = await pool.query(`
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);

    // Return messages in chronological order (oldest first)
    const messages = result.rows.reverse();

    res.json({ success: true, data: messages, page, limit });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === parseInt(otherUserId)) {
      return res.status(400).json({ success: false, message: "Cannot create conversation with yourself" });
    }

    // Check if an accepted connection exists
    const connCheck = await pool.query(`
      SELECT * FROM connections 
      WHERE status = 'Accepted' 
      AND (
        (requester_id = $1 AND recipient_id = $2)
        OR (requester_id = $2 AND recipient_id = $1)
      )
    `, [currentUserId, otherUserId]);

    if (connCheck.rowCount === 0) {
      return res.status(403).json({ success: false, message: "You can only message accepted connections." });
    }

    // Determine user1_id and user2_id to prevent duplicates
    const user1_id = Math.min(currentUserId, otherUserId);
    const user2_id = Math.max(currentUserId, otherUserId);

    // Check if conversation already exists
    let convCheck = await pool.query(`
      SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2
    `, [user1_id, user2_id]);

    let conversation;

    if (convCheck.rowCount > 0) {
      conversation = convCheck.rows[0];
    } else {
      const insertRes = await pool.query(`
        INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *
      `, [user1_id, user2_id]);
      conversation = insertRes.rows[0];
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT count(*) as unread_count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = FALSE
    `, [userId]);

    res.json({ success: true, count: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin Endpoints
export const getAllConversationsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id as conversation_id,
        c.last_message_at,
        c.created_at,
        u1.name as user1_name,
        u1.role as user1_role,
        u2.name as user2_name,
        u2.role as user2_role,
        (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id) as message_count
      FROM conversations c
      JOIN users u1 ON u1.id = c.user1_id
      JOIN users u2 ON u2.id = c.user2_id
      ORDER BY c.last_message_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching all conversations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getConversationMessagesAdmin = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id,
        m.message,
        m.created_at,
        m.is_read,
        m.read_at,
        u.name as sender_name,
        u.role as sender_role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
    `, [conversationId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
