// controllers/DownloadController.ts
import { Request, Response } from "express";
import { DownloadService } from "../services/downloadService";
import { DocumentRepository } from "../repositories/implementations/documentRepository";
import { ConsoleLogger } from "../logging/console.logger";

const logger = new ConsoleLogger();
const documentRepository = new DocumentRepository();
const downloadService = new DownloadService(documentRepository, logger);

class DownloadController {
  // Centralized response handler
  private static handleResponse(
    result: any,
    res: Response,
    successStatus = 200
  ) {
    if (result.isFailure()) {
      const statusCode = result.value === "Document not found" ? 404 : 403;
      return res.status(statusCode).json({ error: result.value });
    }
    return res.status(successStatus).json({ downloadLink: result.value });
  }

  static async generateDownloadLink(req: Request, res: Response) {
    const { documentId } = req.params;
    const result: any = await downloadService.generateDownloadLink(
      documentId,
      req.protocol,
      req.get("host") as string
    );

    DownloadController.handleResponse(result, res);
  }

  static async downloadFile(req: Request, res: Response) {
    const { documentId } = req.params;
    const { token } = req.query as { token: string };

    const result: any = await downloadService.downloadFile(documentId, token);

    if (result.isFailure()) {
      return res.status(403).json({ error: result.value });
    }

    res.download(result.value);
  }
}

export default DownloadController;
