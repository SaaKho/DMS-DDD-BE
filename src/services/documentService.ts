// services/documentService.ts
import { IDocumentRepository } from "../repositories/interfaces/IDocumentRepository";
import { ITagRepository } from "../repositories/interfaces/ITagRepository";
import { IPermissionsRepository } from "../repositories/interfaces/IPermissionRepository";
import { Logger } from "../logging/logger";
import { Either, ok, failure } from "../utils/monads";
import path from "path";
import fs from "fs/promises";
import { Pagination } from "../utils/Pagination";
import { DocumentFactory } from "../factories/DocumentFactory";
import { PermissionFactory } from "../factories/PermissionFactory";
import { Document } from "../entities/Document";

export class DocumentService {
  constructor(
    private documentRepository: IDocumentRepository,
    private tagRepository: ITagRepository,
    private permissionsRepository: IPermissionsRepository,
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

    // Step 1: Create a Document entity using DocumentFactory
    const document = DocumentFactory.create(
      fileName,
      fileExtension,
      filepath,
      userId
    );

    // Step 2: Add the Document entity to the repository
    const documentResult = await this.documentRepository.add(document);
    if (documentResult.isFailure()) return failure("Failed to create document");

    const createdDocument = documentResult.value;

    // Step 3: Retrieve or create tags
    const tagsResult = await this.tagRepository.getOrCreateTags(tagNames);
    if (tagsResult.isFailure())
      return failure("Failed to retrieve or create tags");

    const tags = tagsResult.value;

    // Step 4: Link document with tags in document_tags table
    const linkResult = await this.tagRepository.linkDocumentWithTags(
      createdDocument.getId(),
      tags
    );
    if (linkResult.isFailure())
      return failure("Failed to link document with tags");

    // Step 5: Assign ownership permission to the user
    const ownershipPermission = PermissionFactory.create(
      createdDocument.getId(),
      userId,
      "Owner"
    );
    const permissionResult = await this.permissionsRepository.assignPermission(
      ownershipPermission
    );
    if (permissionResult.isFailure())
      return failure("Failed to assign permission");

    return ok({ document: createdDocument, tags });
  }

  async fetchDocumentById(
    id: string
  ): Promise<Either<string, Document | null>> {
    return this.documentRepository.fetchById(id);
  }

  async updateDocument(
    userId: string,
    id: string,
    fileName?: string,
    fileExtension?: string
  ): Promise<Either<string, Document | null>> {
    this.logger.log(
      `Starting update process for document ${id} by user ${userId}`
    );

    // Fetch the existing document from the repository
    const documentResult = await this.documentRepository.fetchById(id);
    if (documentResult.isFailure() || !documentResult.value) {
      this.logger.error(`Document ${id} not found`);
      return failure("Document not found");
    }

    const existingDocument = documentResult.value;
    this.logger.log(
      `Fetched document ${id} with current owner ${existingDocument.getUserId()}`
    );

    // Check permissions for ownership
    const permissionToCheck = PermissionFactory.create(id, userId, "");
    const permissionResult =
      await this.permissionsRepository.fetchUserPermission(permissionToCheck);

    if (
      permissionResult.isFailure() ||
      !permissionResult.value ||
      permissionResult.value.getPermissionType() !== "Owner"
    ) {
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
      `${existingDocument.getFileName()}.${existingDocument.getFileExtension()}`
    );
    const newFilePath = path.join(
      __dirname,
      "../../uploads",
      `${fileName || existingDocument.getFileName()}.${
        fileExtension || existingDocument.getFileExtension()
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

    // Create an updated Document entity
    const updatedDocument = DocumentFactory.create(
      fileName || existingDocument.getFileName(),
      fileExtension || existingDocument.getFileExtension(),
      newFilePath,
      existingDocument.getUserId()
    );

    // Update the document in the repository
    return this.documentRepository.update(updatedDocument);
  }

  async deleteDocument(
    id: string,
    userId: string
  ): Promise<Either<string, boolean>> {
    this.logger.log(
      `Attempting to delete document with ID: ${id} by user: ${userId}`
    );

    // Check if the user has permission to delete the document
    const permissionToCheck = PermissionFactory.create(id, userId, "");
    const permissionResult =
      await this.permissionsRepository.fetchUserPermission(permissionToCheck);

    if (
      permissionResult.isFailure() ||
      !permissionResult.value ||
      permissionResult.value.getPermissionType() !== "Owner"
    ) {
      this.logger.error(
        `User ${userId} does not have permission to delete document ${id}`
      );
      return failure("Only the owner can delete this document");
    }

    // Proceed with deleting the document
    try {
      const deleteResult = await this.documentRepository.remove(id);
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
  ): Promise<Either<string, Pagination<Document>>> {
    this.logger.log(
      `Fetching paginated documents for page: ${page}, limit: ${limit}`
    );

    const documentsResult = await this.documentRepository.fetchAll();
    if (documentsResult.isFailure()) {
      return failure(documentsResult.value);
    }

    const documents = documentsResult.value;
    const pagination = new Pagination(documents, documents.length, page, limit);

    return ok(pagination);
  }
}
