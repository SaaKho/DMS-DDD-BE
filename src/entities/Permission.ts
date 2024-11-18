import { v4 as uuidv4 } from "uuid";

export class Permission {
  private readonly id: string;
  private readonly documentId: string;
  private readonly userId: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private permissionType: string;

  constructor(
    documentId: string,
    userId: string,
    permissionType: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4(); // Generate UUID if not provided
    this.documentId = documentId;
    this.userId = userId;
    this.permissionType = permissionType;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.documentId.trim()) {
      throw new Error("Document ID cannot be empty.");
    }
    if (!this.userId.trim()) {
      throw new Error("User ID cannot be empty.");
    }
    if (!["Owner", "Editor", "Viewer"].includes(this.permissionType)) {
      throw new Error(
        "Invalid permission type. Allowed types: Owner, Editor, Viewer."
      );
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getDocumentId(): string {
    return this.documentId;
  }
  getUserId(): string {
    return this.userId;
  }
  getPermissionType(): string {
    return this.permissionType;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Update methods
  updatePermissionType(newType: string): void {
    if (!["Owner", "Editor", "Viewer"].includes(newType)) {
      throw new Error(
        "Invalid permission type. Allowed types: Owner, Editor, Viewer."
      );
    }
    this.permissionType = newType;
    this.updatedAt = new Date();
  }
}
