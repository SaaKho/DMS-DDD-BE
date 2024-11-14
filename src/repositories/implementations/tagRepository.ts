// repositories/implementations/TagRepository.ts
import { ITagRepository } from "../interfaces/ITagRepository";
import { db, tags } from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export class TagRepository implements ITagRepository {
  async add(name: string): Promise<Either<string, any>> {
    try {
      const newTag = await db
        .insert(tags)
        .values({ id: uuidv4(), name })
        .returning()
        .execute();
      return ok(newTag[0]);
    } catch (error) {
      return failure("Failed to create tag");
    }
  }

  async update(id: string, name: string): Promise<Either<string, any | null>> {
    try {
      const updatedTag = await db
        .update(tags)
        .set({ name })
        .where(eq(tags.id, id))
        .returning()
        .execute();
      return updatedTag.length > 0 ? ok(updatedTag[0]) : ok(null);
    } catch (error) {
      return failure("Failed to update tag");
    }
  }

  async remove(id: string): Promise<Either<string, boolean>> {
    try {
      const deleteResult = await db
        .delete(tags)
        .where(eq(tags.id, id))
        .execute();
      return ok((deleteResult.rowCount ?? 0) > 0);
    } catch (error) {
      return failure("Failed to delete tag");
    }
  }
  async fetchAll(): Promise<Either<string, any[]>> {
    try {
      const allTags = await db.select().from(tags).execute();
      return ok(allTags);
    } catch (error) {
      return failure("Failed to fetch tags");
    }
  }
}
