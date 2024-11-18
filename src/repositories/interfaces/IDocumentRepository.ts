// src/repositories/interfaces/IDocumentRepository.ts
import { Either } from "../../utils/monads";
import { Document } from "../../entities/Document";

export interface IDocumentRepository {
  add(document: Document): Promise<Either<string, Document>>;
  fetchById(id: string): Promise<Either<string, Document | null>>;
  update(document: Document): Promise<Either<string, Document | null>>;
  remove(id: string): Promise<Either<string, boolean>>;
  fetchAll(): Promise<Either<string, Document[]>>;
}
