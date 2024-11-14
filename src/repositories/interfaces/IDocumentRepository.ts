// interfaces/IDocumentRepository.ts
import { Either } from "../../utils/monads";

export interface IDocumentRepository {
  add(
    fileName: string,
    fileExtension: string,
    filepath: string,
    userId: string
  ): Promise<Either<string, any>>;
  fetchById(id: string): Promise<Either<string, any | null>>;
  update(
    id: string,
    fileName?: string,
    fileExtension?: string,
    filepath?: string
  ): Promise<Either<string, any | null>>;
  remove(id: string): Promise<Either<string, boolean>>;
  getOrCreateTags(tagNames: string[]): Promise<Either<string, any[]>>;
    linkDocumentWithTags(
    documentId: string,
    tags: any[]
  ): Promise<Either<string, boolean>>;
  assignPermission(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<Either<string, any>>;
  fetchAll(): Promise<Either<string, any[]>>;
  fetchUserRole(userId: string): Promise<Either<string, string>>;
  fetchUserPermission(documentId: string, userId: string): Promise<Either<string, string>>;
}
