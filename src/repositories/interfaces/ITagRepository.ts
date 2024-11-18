// src/repositories/interfaces/ITagRepository.ts
import { Either } from "../../utils/monads";
import { Tag } from "../../entities/Tag";

export interface ITagRepository {
  fetchAll(): Promise<Either<string, Tag[]>>;
  add(tag: Tag): Promise<Either<string, Tag>>;
  update(tag: Tag): Promise<Either<string, Tag | null>>;
  remove(tag: Tag): Promise<Either<string, boolean>>;
  fetchById(id: string): Promise<Either<string, Tag | null>>;
  getOrCreateTags(tagNames: string[]): Promise<Either<string, Tag[]>>;
  linkDocumentWithTags(
    documentId: string,
    tags: Tag[]
  ): Promise<Either<string, boolean>>;
  fetchTags(tagNames: string[]): Promise<Either<string, string[]>>;
}
