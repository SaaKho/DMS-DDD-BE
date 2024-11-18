import { IDocumentRepository } from "../interfaces/IDocumentRepository";
import { db, documents } from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { Document } from "../../entities/Document";
import { eq } from "drizzle-orm";

export class DocumentRepository implements IDocumentRepository {
  async add(document: Document): Promise<Either<string, Document>> {
    try {
      const newDocument = await db
        .insert(documents)
        .values({
          id: document.getId(),
          fileName: document.getFileName(),
          fileExtension: document.getFileExtension(),
          filepath: document.getFilepath(),
          userId: document.getUserId(),
          createdAt: document.getCreatedAt(),
          updatedAt: document.getUpdatedAt(),
        })
        .returning();

      return ok(this.toEntity(newDocument[0]));
    } catch (error) {
      return failure("Failed to create document");
    }
  }

  async fetchById(id: string): Promise<Either<string, Document | null>> {
    try {
      const result = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .execute();
      return ok(result[0] ? this.toEntity(result[0]) : null);
    } catch (error) {
      return failure("Failed to fetch document by ID");
    }
  }

  async update(document: Document): Promise<Either<string, Document | null>> {
    try {
      const updatedDocument = await db
        .update(documents)
        .set({
          fileName: document.getFileName(),
          fileExtension: document.getFileExtension(),
          filepath: document.getFilepath(),
          updatedAt: new Date(),
        })
        .where(eq(documents.id, document.getId()))
        .returning()
        .execute();

      return updatedDocument[0]
        ? ok(this.toEntity(updatedDocument[0]))
        : failure("Document not found for update");
    } catch (error) {
      return failure("Failed to update document");
    }
  }

  async remove(id: string): Promise<Either<string, boolean>> {
    try {
      const result = await db.delete(documents).where(eq(documents.id, id)).execute();
      return ok(result?.rowCount ? result.rowCount > 0 : false);
    } catch (error) {
      return failure("Failed to delete document");
    }
  }

  async fetchAll(): Promise<Either<string, Document[]>> {
    try {
      const allDocuments = await db.select().from(documents).execute();
      return ok(allDocuments.map(this.toEntity));
    } catch (error) {
      return failure("Failed to fetch documents");
    }
  }

  private toEntity(row: any): Document {
    return new Document(
      row.fileName,
      row.fileExtension,
      row.filepath,
      row.userId,
      row.id,
      row.createdAt,
      row.updatedAt
    );
  }
}
