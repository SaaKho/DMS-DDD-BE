// repositories/implementations/documentRepository.ts
import { IDocumentRepository } from "../interfaces/IDocumentRepository";
import {
  db,
  documents,
  tags,
  permissions,
  users,
  documentTags,
} from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { v4 as uuidv4 } from "uuid";
import { eq, or, and } from "drizzle-orm";

export class DocumentRepository implements IDocumentRepository {
  async add(
    fileName: string,
    fileExtension: string,
    filepath: string,
    userId: string
  ): Promise<Either<string, any>> {
    try {
      const newDocument = await db
        .insert(documents)
        .values({
          id: uuidv4(),
          fileName,
          fileExtension,
          filepath,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return ok(newDocument[0]);
    } catch (error) {
      return failure("Failed to create document");
    }
  }

  async fetchById(id: string): Promise<Either<string, any | null>> {
    try {
      const result = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .execute();
      return ok(result[0] || null);
    } catch (error) {
      return failure("Failed to fetch document by ID");
    }
  }

  async remove(id: string): Promise<Either<string, boolean>> {
    try {
      const result: any = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .execute();

      if (result?.rowCount > 0) {
        return ok(true);
      } else {
        return failure("Document not found for deletion");
      }
    } catch (error) {
      return failure("Failed to delete document");
    }
  }
  async fetchAll(): Promise<Either<string, any[]>> {
    try {
      const allDocuments = await db.select().from(documents).execute();
      return ok(allDocuments);
    } catch (error) {
      return failure("Failed to fetch Documents");
    }
  }
  async update(
    id: string,
    fileName?: string,
    fileExtension?: string,
    filepath?: string
  ): Promise<Either<string, any | null>> {
    try {
      const updatedDocument = await db
        .update(documents)
        .set({
          fileName,
          fileExtension,
          filepath,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id))
        .returning()
        .execute();

      if (updatedDocument.length === 0) {
        return failure("Document not found for update");
      }

      return ok(updatedDocument[0]);
    } catch (error: any) {
      return failure("Failed to update document");
    }
  }

  async assignPermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<Either<string, any>> {
    try {
      const newPermission = await db
        .insert(permissions)
        .values({
          id: uuidv4(),
          documentId,
          userId,
          permissionType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();
      return ok(newPermission[0]);
    } catch (error) {
      return failure("Failed to assign permission");
    }
  }
  async getOrCreateTags(tagNames: string[]): Promise<Either<string, any[]>> {
    try {
      const existingTags = await db
        .select()
        .from(tags)
        .where(or(...tagNames.map((name) => eq(tags.name, name))))
        .execute();
      const newTagNames = tagNames.filter(
        (name) => !existingTags.some((tag) => tag.name === name)
      );
      const newTags = await Promise.all(
        newTagNames.map(async (name) => {
          const newTag = await db
            .insert(tags)
            .values({
              id: uuidv4(),
              name,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
            .execute();
          return newTag[0];
        })
      );
      return ok([...existingTags, ...newTags]);
    } catch (error) {
      return failure("Failed to get or create tags");
    }
  }
  // Fetch user role from the users table
  async fetchUserRole(userId: string): Promise<Either<string, string>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();
      return ok(result[0]?.role || "");
    } catch (error) {
      return failure("Failed to fetch user role");
    }
  }

  // Fetch user permission type from the permissions table for a specific document
  async fetchUserPermission(
    documentId: string,
    userId: string
  ): Promise<Either<string, string>> {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, userId),
            eq(permissions.permissionType, "Owner")
          )
        )
        .execute();

      if (result.length === 0) {
        return failure("Permission not found");
      }

      return ok(result[0].permissionType);
    } catch (error: any) {
      return failure("Failed to fetch user permissions");
    }
  }
  async linkDocumentWithTags(
    documentId: string,
    tags: any[]
  ): Promise<Either<string, boolean>> {
    try {
      // Map tags to create an array of { documentId, tagId } objects
      const documentTagsData = tags.map((tag) => ({
        documentId,
        tagId: tag.id,
      }));

      // Insert the document-tag pairs into the document_tags table
      await db.insert(documentTags).values(documentTagsData).execute();

      return ok(true);
    } catch (error: any) {
      return failure("Failed to link document with tags");
    }
  }

}
