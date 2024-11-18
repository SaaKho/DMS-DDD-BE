import { db, documents, tags, documentTags } from "../drizzle/schema";
import { inArray } from "drizzle-orm";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";

export class SearchService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async searchDocumentsByTags(
    tagNames: string | string[]
  ): Promise<Either<string, any[]>> {
    try {
      this.logger.log("Starting searchDocumentsByTags service...");
      this.logger.log(`Filtering by tags: ${tagNames}`);

      // Ensure tagNames is an array
      const tagList = Array.isArray(tagNames) ? tagNames : tagNames.split(",");

      // Step 1: Fetch matching tags from the database
      const existingTags = await db
        .select({ id: tags.id, name: tags.name })
        .from(tags)
        .where(inArray(tags.name, tagList))
        .execute();

      if (existingTags.length === 0) {
        this.logger.error("No matching tags found in the database.");
        return failure(`No matching tags found for: ${tagNames}`);
      }

      this.logger.log(`Matching tags found: ${JSON.stringify(existingTags)}`);

      // Step 2: Fetch document IDs linked to these tags
      const tagIds = existingTags.map((tag) => tag.id);

      const documentTagsQuery = await db
        .select({ documentId: documentTags.documentId })
        .from(documentTags)
        .where(inArray(documentTags.tagId, tagIds))
        .execute();

      const documentIds = documentTagsQuery.map((row) => row.documentId);

      if (documentIds.length === 0) {
        this.logger.error(
          `Tags found but no documents are associated with the given tags: ${tagNames}`
        );
        return failure(
          `Tags found, but no documents are associated with the given tags: ${tagNames}`
        );
      }

      this.logger.log(`Document IDs matching tags: ${documentIds}`);

      // Step 3: Fetch documents matching these IDs
      const results = await db
        .select()
        .from(documents)
        .where(inArray(documents.id, documentIds))
        .execute();

      this.logger.log(
        `Search query executed successfully. Found ${results.length} documents.`
      );

      return ok(results);
    } catch (error) {
      this.logger.error(`Error in searchDocumentsByTags service: ${error}`);
      return failure("Failed to search documents by tags");
    }
  }
}
