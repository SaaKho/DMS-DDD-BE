// repositories/interfaces/ITagRepository.ts
import { Either } from "../../utils/monads";

export interface ITagRepository {
  fetchAll(): Promise<Either<string, any[]>>;
  add(name: string): Promise<Either<string, any>>;
  update(id: string, name: string): Promise<Either<string, any | null>>;
  remove(id: string): Promise<Either<string, boolean>>;
}
