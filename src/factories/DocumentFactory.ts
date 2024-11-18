import { Document } from "../entities/Document";

export class DocumentFactory {
  static create(
    fileName: string,
    fileExtension: string,
    filepath: string,
    userId: string
  ): Document {
    return new Document(fileName, fileExtension, filepath, userId);
  }
}
