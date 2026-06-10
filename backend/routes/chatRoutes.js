import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getMessages,
  getOrCreateConversation,
  getUnreadCount,
  getAllConversationsAdmin,
  getConversationMessagesAdmin
} from "../controllers/chatController.js";

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// Admin routes
router.get("/admin/conversations", isAdmin, getAllConversationsAdmin);
router.get("/admin/:conversationId/messages", isAdmin, getConversationMessagesAdmin);

router.get("/unread-count", getUnreadCount);
router.get("/conversations", getConversations);
router.get("/:conversationId/messages", getMessages);
router.post("/conversation/:userId", getOrCreateConversation);

export default router;
