import { Either } from "../../utils/monads";
import { User } from "../../entities/User";

export interface IUserRepository {
  add(user: User): Promise<Either<string, User>>;
  fetchById(id: string): Promise<Either<string, User | null>>;
  fetchByUsername(username: string): Promise<Either<string, User | null>>;
  fetchByEmail(email: string): Promise<Either<string, User | null>>;
  fetchAll(): Promise<Either<string, User[]>>;
  update(user: User): Promise<Either<string, User | null>>;
  remove(id: string): Promise<Either<string, boolean>>;
  fetchUserRole(userId: string): Promise<Either<string, string>>;
}
