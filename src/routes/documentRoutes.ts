// routes/document/documentRoutes.ts
import express from "express";
import { DocumentController } from "../controller/documentController";
import { uploadMiddleware } from "../utils/uploads";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/upload",
  AuthMiddleware,
  uploadMiddleware.single("file"),
  DocumentController.uploadDocument
);
router.put("/update/:id", AuthMiddleware, DocumentController.updateDocument);
router.delete("/delete/:id", AuthMiddleware, DocumentController.deleteDocument);
router.get(
  "/paginate",
  AuthMiddleware,
  DocumentController.getPaginatedDocuments
);
router.get(
  "/getDocument/:id",
  AuthMiddleware,
  DocumentController.getDocumentById
);

export default router;
