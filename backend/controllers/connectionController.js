import { pool } from "../config/db.js";

// Get all students (for connection suggestions)
export const getAllStudents = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Get all students except the current user
    let query = `
      SELECT id, name, email, branch, created_at 
      FROM users 
      WHERE role = 'student'
    `;
    let params = [];
    
    if (userId) {
      query += ` AND id != $1`;
      params.push(userId);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get connection status between current user and other students
export const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    // Get all connections involving current user
    const result = await pool.query(
      `SELECT * FROM connections 
       WHERE (requester_id = $1 AND recipient_id = $2) 
          OR (requester_id = $2 AND recipient_id = $1)`,
      [currentUserId, userId]
    );
    
    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error("Get connection status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all connections for current user
export const getMyConnections = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    const result = await pool.query(
      `SELECT c.*, 
              u.id as user_id, u.name, u.email, u.branch,
              CASE WHEN c.requester_id = $1 THEN 'sent' ELSE 'received' END as direction
       FROM connections c
       JOIN users u ON u.id = CASE 
         WHEN c.requester_id = $1 THEN c.recipient_id 
         ELSE c.requester_id 
       END
       WHERE c.requester_id = $1 OR c.recipient_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Get my connections error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user?.id;
    
    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required"
      });
    }
    
    if (requesterId === parseInt(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot send connection request to yourself"
      });
    }
    
    // Check if connection already exists
    const existingConnection = await pool.query(
      `SELECT * FROM connections 
       WHERE (requester_id = $1 AND recipient_id = $2) 
          OR (requester_id = $2 AND recipient_id = $1)`,
      [requesterId, recipientId]
    );
    
    if (existingConnection.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Connection request already exists"
      });
    }
    
    // Create connection request
    const result = await pool.query(
      `INSERT INTO connections (requester_id, recipient_id, status)
       VALUES ($1, $2, 'Pending')
       RETURNING *`,
      [requesterId, recipientId]
    );
    
    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    // Check if connection exists and user is the recipient
    const connection = await pool.query(
      `SELECT * FROM connections WHERE id = $1 AND recipient_id = $2`,
      [connectionId, userId]
    );
    
    if (connection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found"
      });
    }
    
    if (connection.rows[0].status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: "Connection request already processed"
      });
    }
    
    // Update connection status
    const result = await pool.query(
      `UPDATE connections 
       SET status = 'Accepted', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [connectionId]
    );
    
    res.json({
      success: true,
      message: "Connection request accepted",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Accept connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reject connection request
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    // Check if connection exists and user is the recipient
    const connection = await pool.query(
      `SELECT * FROM connections WHERE id = $1 AND recipient_id = $2`,
      [connectionId, userId]
    );
    
    if (connection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found"
      });
    }
    
    // Update connection status
    const result = await pool.query(
      `UPDATE connections 
       SET status = 'Rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [connectionId]
    );
    
    res.json({
      success: true,
      message: "Connection request rejected",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Reject connection request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get pending connection requests received by current user
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    const result = await pool.query(
      `SELECT c.*, u.id as requester_id, u.name, u.email, u.branch
       FROM connections c
       JOIN users u ON u.id = c.requester_id
       WHERE c.recipient_id = $1 AND c.status = 'Pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};