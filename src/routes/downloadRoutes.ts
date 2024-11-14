import express from "express";
import DownloadController from "../controller/downloadController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Route to generate a short-lived download link
router.post(
  "/generate/:documentId",
  authMiddleware,
  DownloadController.generateDownloadLink
);

// Route to download file using the generated link
router.get("/:documentId", DownloadController.downloadFile);

export default router;
