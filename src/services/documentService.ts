// services/documentService.ts
import { IDocumentRepository } from "../repositories/interfaces/IDocumentRepository";
import { Logger } from "../logging/logger";
import { Either, ok, failure } from "../utils/monads";
import path from "path";
import fs from "fs/promises";
import { Pagination } from "../utils/Pagination";

export class DocumentService {
  constructor(
    private documentRepository: IDocumentRepository,
    private logger: Logger
  ) {}

  async createDocument(
    fileName: string,
    fileExtension: string,
    filepath: string,
    userId: string,
    tagNames: string[]
  ): Promise<Either<string, any>> {
    this.logger.log("Creating document");

    // Step 1: Create the document
    const documentResult: any = await this.documentRepository.add(
      fileName,
      fileExtension,
      filepath,
      userId
    );
    if (documentResult.isFailure()) return failure("Failed to create document");

    const document = documentResult.value;

    const tagsResult: any = await this.documentRepository.getOrCreateTags(
      tagNames
    );
    if (tagsResult.isFailure())
      return failure("Failed to retrieve or create tags");

    const tags = tagsResult.value;

    // Step 3: Link document with tags in document_tags table
    const linkResult = await this.documentRepository.linkDocumentWithTags(
      document.id,
      tags
    );
    if (linkResult.isFailure())
      return failure("Failed to link document with tags");

    // Step 4: Assign ownership permission to the user
    const permissionResult = await this.documentRepository.assignPermission(
      document.id,
      userId,
      "Owner"
    );
    if (permissionResult.isFailure())
      return failure("Failed to assign permission");

    return ok({ document, tags });
  }

  async fetchDocumentById(id: string): Promise<Either<string, any | null>> {
    return this.documentRepository.fetchById(id);
  }

  async updateDocument(
    userId: string,
    id: string,
    fileName?: string,
    fileExtension?: string
  ): Promise<Either<string, any | null>> {
    this.logger.log(
      `Starting update process for document ${id} by user ${userId}`
    );

    // Fetch the document to check if it exists
    const documentResult: any = await this.documentRepository.fetchById(id);
    if (documentResult.isFailure() || !documentResult.value) {
      this.logger.error(`Document ${id} not found`);
      return failure("Document not found");
    }

    const existingDocument = documentResult.value;
    this.logger.log(
      `Fetched document ${id} with current owner ${existingDocument.userId}`
    );

    // Check permissions for ownership
    const permissionResult: any =
      await this.documentRepository.fetchUserPermission(id, userId);
    if (permissionResult.isFailure() || permissionResult.value !== "Owner") {
      this.logger.error(
        `User ${userId} does not have permission to update document ${id}`
      );
      return failure("Only the owner can update this document");
    }
    this.logger.log(`User ${userId} verified as owner for document ${id}`);

    // Proceed with renaming the file if necessary
    const oldFilePath = path.join(
      __dirname,
      "../../uploads",
      `${existingDocument.fileName}.${existingDocument.fileExtension}`
    );
    const newFilePath = path.join(
      __dirname,
      "../../uploads",
      `${fileName || existingDocument.fileName}.${
        fileExtension || existingDocument.fileExtension
      }`
    );

    try {
      if (oldFilePath !== newFilePath) {
        this.logger.log(`Renaming file from ${oldFilePath} to ${newFilePath}`);
        await fs.rename(oldFilePath, newFilePath);
        this.logger.log(`File renamed successfully to ${newFilePath}`);
      }
    } catch (error) {
      this.logger.error("Failed to rename file");
      return failure("Failed to rename file");
    }

    // Update the document in the database
    this.logger.log(`Updating document ${id} in the database`);
    return this.documentRepository.update(
      id,
      fileName,
      fileExtension,
      newFilePath
    );
  }
  async deleteDocument(
    id: string,
    userId: string
  ): Promise<Either<string, boolean>> {
    this.logger.log(
      `Attempting to delete document with ID: ${id} by user: ${userId}`
    );

    // Check if the user has permission to delete the document
    const permissionResult: any =
      await this.documentRepository.fetchUserPermission(id, userId);
    if (permissionResult.isFailure() || permissionResult.value !== "Owner") {
      this.logger.error(
        `User ${userId} does not have permission to delete document ${id}`
      );
      return failure("Only the owner can delete this document");
    }

    // Proceed with deleting the document
    try {
      const deleteResult: any = await this.documentRepository.remove(id);
      if (deleteResult.isFailure() || !deleteResult.value) {
        this.logger.error("Failed to delete document from repository.");
        return failure("Failed to delete document");
      }
      this.logger.log("Document deleted successfully.");
      return ok(true);
    } catch (error) {
      this.logger.error(
        "An unexpected error occurred while deleting the document."
      );
      return failure("Failed to delete document");
    }
  }
  async getPaginatedDocuments(
    page: number,
    limit: number
  ): Promise<Either<string, any>> {
    const usersResult: any = await this.documentRepository.fetchAll();
    if (usersResult.isFailure()) {
      return failure(usersResult.value);
    }

    const users = usersResult.value;
    const pagination = new Pagination(users, users.length, page, limit);
    const paginatedData = pagination.getPaginatedData();

    return ok(paginatedData);
  }
}
