import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { pool } from "./config/db.js";

let io;

export const initializeSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  // Track online users mapping: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.name})`);
    
    // Store user as online
    onlineUsers.set(socket.user.id.toString(), socket.id);
    // Broadcast to others that this user is online
    socket.broadcast.emit("user_online", socket.user.id);

    // Send the current list of online users to the connected client
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineUserIds);

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.id} joined conversation_${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      const { conversationId, receiverId, message } = data;
      const senderId = socket.user.id;

      try {
        // Validate connection before allowing message
        const connectionCheck = await pool.query(`
          SELECT * FROM connections 
          WHERE status = 'Accepted' 
          AND (
            (requester_id = $1 AND recipient_id = $2)
            OR (requester_id = $2 AND recipient_id = $1)
          )
        `, [senderId, receiverId]);

        if (connectionCheck.rowCount === 0) {
          return socket.emit("error", { message: "No accepted connection exists with this user." });
        }

        // Validate conversation exists and belongs to these users
        const convCheck = await pool.query(`
          SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
        `, [conversationId, senderId]);

        if (convCheck.rowCount === 0) {
          return socket.emit("error", { message: "Invalid conversation." });
        }

        // Insert message
        const msgRes = await pool.query(`
          INSERT INTO messages (conversation_id, sender_id, message) 
          VALUES ($1, $2, $3) RETURNING *
        `, [conversationId, senderId, message]);

        const newMessage = msgRes.rows[0];

        // Update last_message_at
        await pool.query(`
          UPDATE conversations SET last_message_at = NOW() WHERE id = $1
        `, [conversationId]);

        // Emit to room
        io.to(`conversation_${conversationId}`).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    socket.on("message_read", async ({ messageId, conversationId }) => {
      try {
        // Mark message as read
        await pool.query(`
          UPDATE messages SET is_read = TRUE, read_at = NOW() 
          WHERE id = $1 AND conversation_id = $2 AND sender_id != $3
        `, [messageId, conversationId, socket.user.id]);

        // Broadcast to room that messages were read
        io.to(`conversation_${conversationId}`).emit("messages_read", { conversationId, readerId: socket.user.id });
      } catch (err) {
        console.error("Error marking message read:", err);
      }
    });

    socket.on("typing", ({ conversationId, receiverId }) => {
      socket.to(`conversation_${conversationId}`).emit("typing", { conversationId, senderId: socket.user.id });
    });

    socket.on("stop_typing", ({ conversationId, receiverId }) => {
      socket.to(`conversation_${conversationId}`).emit("stop_typing", { conversationId, senderId: socket.user.id });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id.toString());
      io.emit("user_offline", socket.user.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
