// routes/document/documentRoutes.ts
import express from "express";
import { DocumentController } from "../controller/documentController";
import { uploadMiddleware } from "../utils/uploads";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("file"),
  DocumentController.uploadDocument
);
router.put("/update/:id", authMiddleware, DocumentController.updateDocument);
router.delete("/delete/:id", authMiddleware, DocumentController.deleteDocument);
router.get(
  "/paginate",
  authMiddleware,
  DocumentController.getPaginatedDocuments
);
router.get(
  "/getDocument/:id",
  authMiddleware,
  DocumentController.getDocumentById
);

export default router;
