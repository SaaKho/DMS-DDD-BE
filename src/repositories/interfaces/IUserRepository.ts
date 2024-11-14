import { UserRole } from "../../drizzle/schema";
import { Either } from "../../utils/monads";

export interface IUserRepository {
  add(
    username: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<Either<string, any>>;
  fetchByEmail(email: string): Promise<Either<string, any | null>>;
  fetchById(id: string): Promise<Either<string, any | null>>;
  fetchByUsername(username: string): Promise<Either<string, any | null>>;
  fetchAll(): Promise<Either<string, any[]>>;
  update(
    id: string,
    username?: string,
    email?: string,
    password?: string,
    role?: UserRole
  ): Promise<Either<string, any | null>>;
  remove(id: string): Promise<Either<string, boolean>>;
}
