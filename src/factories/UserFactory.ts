import { User } from "../entities/User";
import { UserRole } from "../drizzle/schema";

export class UserFactory {
  static create(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.User
  ): User {
    return new User(username, email, password, role); // UUID generated in entity
  }
}
