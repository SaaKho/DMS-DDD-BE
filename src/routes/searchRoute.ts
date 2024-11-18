import express from "express";
import SearchController from "../controller/searchController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Route to search documents with advanced filters
router.get("/", AuthMiddleware, SearchController.searchDocuments);

export default router;
