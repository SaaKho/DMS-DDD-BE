// controllers/documentController.ts
import { Request, Response } from "express";
import { DocumentService } from "../services/documentService";
import { DocumentRepository } from "../repositories/implementations/documentRepository";
import { ConsoleLogger } from "../logging/console.logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const documentService = new DocumentService(
  new DocumentRepository(),
  new ConsoleLogger()
);

class DocumentController {
  private static handleResponse(
    result: any,
    res: Response,
    successStatus = 200
  ) {
    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }
    if (!result.value) {
      return res.status(404).json({ message: "Document not found." });
    }
    return res.status(successStatus).json(result.value);
  }

  static uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    const userId = req.user?.id;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!userId)
      return res.status(403).json({ error: "User not authenticated" });

    const tagNames =
      typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags;
    if (!Array.isArray(tagNames))
      return res.status(400).json({ error: "Tags should be an array" });

    const originalName = file.originalname;
    const fileName =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const fileExtension = originalName.split(".").pop() || "";

    const relativeFilePath = `uploads/${fileName}.${fileExtension}`;

    const result = await documentService.createDocument(
      fileName,
      fileExtension,
      relativeFilePath,
      userId,
      tagNames
    );

    DocumentController.handleResponse(result, res, 201);
  };

  static getDocumentById = async (req: Request, res: Response) => {
    const result = await documentService.fetchDocumentById(req.params.id);
    DocumentController.handleResponse(result, res);
  };

  static updateDocument = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    // const userId = req.user.id;
    const documentId = req.params.id;
    const { fileName, fileExtension } = req.body;

    console.log(`Request to update document ${documentId} by user ${userId}`);

    const result = await documentService.updateDocument(
      userId,
      documentId,
      fileName,
      fileExtension
    );

    DocumentController.handleResponse(result, res);
  };

  static deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    // const userId = req.user.id;

    const result = await documentService.deleteDocument(req.params.id, userId);

    DocumentController.handleResponse(result, res, 204);
  };
  static async getPaginatedDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result: any = await documentService.getPaginatedDocuments(
      page,
      limit
    );

    if (result.isFailure()) {
      res.status(500).json({ error: result.value });
    } else {
      res.json(result.value);
    }
  }
}

export { DocumentController };
