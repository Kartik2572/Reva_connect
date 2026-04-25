import express from "express";
import { getPosts, createPost, updatePost, getPostsByAuthor, deletePost } from "../controllers/postController.js";
import { verifyToken, isAlumni, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getPosts);
router.post("/", isAlumni, createPost);
router.put("/:id", isAlumni, updatePost);
router.get("/author/:author", getPostsByAuthor);
router.delete("/:id", isAlumni, deletePost);

export default router;

