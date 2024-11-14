// services/SearchService.ts
import { db, documents, tags, documentTags } from "../drizzle/schema";
import { inArray, ilike, eq, between } from "drizzle-orm";
import { Either, ok, failure } from "../utils/monads";

export class SearchService {
  async searchDocuments(filters: any): Promise<Either<string, any[]>> {
    try {
      const { filename, fileExtension, tagNames, startDate, endDate } = filters;

      // Start with the base query
      let query: any = db.select().from(documents);

      // Filter by filename (case-insensitive)
      if (filename) {
        query = query.where(ilike(documents.fileName, `%${filename}%`));
      }

      // Filter by file extension
      if (fileExtension) {
        query = query.where(
          eq(documents.fileExtension, fileExtension as string)
        );
      }

      // Filter by date range
      if (startDate && endDate) {
        query = query.where(
          between(
            documents.createdAt,
            new Date(startDate as string),
            new Date(endDate as string)
          )
        );
      }

      // Filter by tags
      if (tagNames) {
        const tagList = (
          typeof tagNames === "string" ? tagNames.split(",") : tagNames
        ) as string[];

        const tagIdsQuery = await db
          .select({ documentId: documentTags.documentId })
          .from(documentTags)
          .innerJoin(tags, eq(documentTags.tagId, tags.id))
          .where(inArray(tags.name, tagList))
          .execute();

        const documentIds = tagIdsQuery.map((tag) => tag.documentId);
        query = query.where(inArray(documents.id, documentIds));
      }

      const results = await query.execute();
      return ok(results);
    } catch (error) {
      console.error("Error in searchDocuments service:", error);
      return failure("Failed to search documents");
    }
  }
}
