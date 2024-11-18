import { ITagRepository } from "../interfaces/ITagRepository";
import { db, tags, documentTags } from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { Tag } from "../../entities/Tag";
import { eq, or, inArray } from "drizzle-orm";

export class TagRepository implements ITagRepository {
  async add(tag: Tag): Promise<Either<string, Tag>> {
    try {
      const newTag = await db
        .insert(tags)
        .values({
          id: tag.getId(),
          name: tag.getName(),
          createdAt: tag.getCreatedAt(),
          updatedAt: tag.getUpdatedAt(),
        })
        .returning()
        .execute();

      return ok(this.toEntity(newTag[0]));
    } catch (error) {
      return failure("Failed to create tag");
    }
  }

  async update(tag: Tag): Promise<Either<string, Tag | null>> {
    try {
      const updatedTag = await db
        .update(tags)
        .set({ name: tag.getName(), updatedAt: new Date() })
        .where(eq(tags.id, tag.getId()))
        .returning()
        .execute();

      return updatedTag.length > 0
        ? ok(this.toEntity(updatedTag[0]))
        : ok(null);
    } catch (error) {
      return failure("Failed to update tag");
    }
  }

  async fetchById(id: string): Promise<Either<string, Tag | null>> {
    try {
      const result = await db
        .select()
        .from(tags)
        .where(eq(tags.id, id))
        .execute();

      return result.length > 0 ? ok(this.toEntity(result[0])) : ok(null);
    } catch (error) {
      return failure("Failed to fetch tag by ID");
    }
  }

  async remove(tag: Tag): Promise<Either<string, boolean>> {
    try {
      const deleteResult = await db
        .delete(tags)
        .where(eq(tags.id, tag.getId()))
        .execute();

      return ok((deleteResult.rowCount ?? 0) > 0);
    } catch (error) {
      return failure("Failed to delete tag");
    }
  }

  async fetchAll(): Promise<Either<string, Tag[]>> {
    try {
      const allTags = await db.select().from(tags).execute();
      return ok(allTags.map(this.toEntity));
    } catch (error) {
      return failure("Failed to fetch tags");
    }
  }

  async getOrCreateTags(tagNames: string[]): Promise<Either<string, Tag[]>> {
    try {
      const existingTags = await db
        .select()
        .from(tags)
        .where(or(...tagNames.map((name) => eq(tags.name, name))))
        .execute();

      const newTagNames = tagNames.filter(
        (name) => !existingTags.some((tag) => tag.name === name)
      );

      // Create new Tag entities for new names
      const newTags = newTagNames.map((name) => new Tag(name));

      // Persist new tags in the database
      await Promise.all(
        newTags.map(async (tag) =>
          db
            .insert(tags)
            .values({
              id: tag.getId(),
              name: tag.getName(),
              createdAt: tag.getCreatedAt(),
              updatedAt: tag.getUpdatedAt(),
            })
            .execute()
        )
      );

      return ok([...existingTags.map(this.toEntity), ...newTags]);
    } catch (error) {
      return failure("Failed to get or create tags");
    }
  }

  async linkDocumentWithTags(
    documentId: string,
    tags: Tag[]
  ): Promise<Either<string, boolean>> {
    try {
      const documentTagsData = tags.map((tag) => ({
        documentId,
        tagId: tag.getId(),
      }));
      await db.insert(documentTags).values(documentTagsData).execute();

      return ok(true);
    } catch (error) {
      return failure("Failed to link document with tags");
    }
  }
  async fetchTags(tagNames: string[]): Promise<Either<string, string[]>> {
    try {
      const tagIdsQuery = await db
        .select({ documentId: documentTags.documentId })
        .from(documentTags)
        .innerJoin(tags, eq(documentTags.tagId, tags.id))
        .where(inArray(tags.name, tagNames))
        .execute();

      const documentIds = tagIdsQuery.map((row) => row.documentId);
      return ok(documentIds);
    } catch (error) {
      return failure("Failed to fetch document IDs for tags");
    }
  }

  // Helper method to convert raw database rows into Tag entities
  private toEntity(row: any): Tag {
    return new Tag(row.name, row.id, row.createdAt, row.updatedAt);
  }
}
