import express from "express";
import { getPosts, createPost, updatePost, getPostsByAuthor, deletePost } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.get("/author/:author", getPostsByAuthor);
router.delete("/:id", deletePost);

export default router;

