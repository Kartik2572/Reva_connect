import express from "express";
import { getPosts, createPost, updatePost, getPostsByAuthor } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.get("/author/:author", getPostsByAuthor);

export default router;

