// services/DownloadService.ts
import jwt from "jsonwebtoken";
import path from "path";
import { DocumentRepository } from "../repositories/implementations/documentRepository";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";
import config from "./../utils/config";

const DOWNLOAD_SECRET = config.jwtSecret;
const LINK_EXPIRATION = config.linkExpiration;

export class DownloadService {
  private documentRepository: DocumentRepository;
  private logger: Logger;

  constructor(documentRepository: DocumentRepository, logger: Logger) {
    this.documentRepository = documentRepository;
    this.logger = logger;
  }
  async generateDownloadLink(
    documentId: string,
    protocol: string,
    host: string
  ): Promise<Either<string, string>> {
    this.logger.log(`Generating download link for document: ${documentId}`);

    // Explicitly type documentResult to help TypeScript infer the type
    const documentResult = await this.documentRepository.fetchById(documentId);

    // Check if fetching the document was successful
    if (documentResult.isFailure()) {
      return failure(documentResult.value);
    }

    // Check if the document exists
    const document = documentResult.value;
    if (!document) {
      return failure("Document not found");
    }

    // Generate the JWT token
    const token = jwt.sign({ documentId }, DOWNLOAD_SECRET, {
      expiresIn: LINK_EXPIRATION,
    });
    const downloadLink = `${protocol}://${host}/api/downloads/${documentId}?token=${token}`;

    return ok(downloadLink);
  }
  async downloadFile(
    documentId: string,
    token: string
  ): Promise<Either<string, string>> {
    try {
      jwt.verify(token, DOWNLOAD_SECRET);
      this.logger.log("Token verified for document download");

      const documentResult = await this.documentRepository.fetchById(
        documentId
      );

      // Check if fetching the document was successful
      if (documentResult.isFailure()) {
        return failure(documentResult.value);
      }

      // Check if the document exists
      const document = documentResult.value;
      if (!document) {
        return failure("Document not found");
      }

      // Construct the full file path with the file name and extension
      const filePath = path.join(
        __dirname,
        "../../uploads",
        `${document.getFileName()}.${document.getFileExtension()}`
      );

      return ok(filePath);
    } catch (error) {
      this.logger.error("Error in downloadFile service");
      return failure("Invalid or expired token");
    }
  }
}
