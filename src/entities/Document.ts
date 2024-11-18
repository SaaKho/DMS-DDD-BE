import { v4 as uuidv4 } from "uuid";

export class Document {
  private readonly id: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private fileName: string;
  private fileExtension: string;
  private filepath: string;
  private readonly userId: string;

  constructor(
    fileName: string,
    fileExtension: string,
    filepath: string,
    userId: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4(); // Generate UUID if not provided
    this.fileName = fileName;
    this.fileExtension = fileExtension;
    this.filepath = filepath;
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (this.fileName.trim() === "") {
      throw new Error("File name cannot be empty.");
    }
    if (this.fileExtension.trim() === "") {
      throw new Error("File extension cannot be empty.");
    }
    if (this.filepath.trim() === "") {
      throw new Error("File path cannot be empty.");
    }
    if (!this.userId) {
      throw new Error("User ID cannot be empty.");
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getFileName(): string {
    return this.fileName;
  }
  getFileExtension(): string {
    return this.fileExtension;
  }
  getFilepath(): string {
    return this.filepath;
  }
  getUserId(): string {
    return this.userId;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Method to update the file path
  updateFilepath(newFilepath: string): void {
    if (newFilepath.trim() === "") {
      throw new Error("File path cannot be empty.");
    }
    this.filepath = newFilepath;
    this.updatedAt = new Date();
  }
}
