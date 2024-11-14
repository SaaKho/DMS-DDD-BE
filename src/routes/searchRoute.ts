import express from "express";
import SearchController from "../controller/searchController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Route to search documents with advanced filters
router.get("/", authMiddleware, SearchController.searchDocuments);

export default router;
