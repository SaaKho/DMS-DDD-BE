import { IUserRepository } from "../interfaces/IUserRepository";
import { db, users } from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { User } from "../../entities/User";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  async add(user: User): Promise<Either<string, User>> {
    try {
      const newUser = await db
        .insert(users)
        .values({
          id: user.getId(),
          username: user.getUsername(),
          email: user.getEmail(),
          password: user.getHashedPassword(),
          role: user.getRole(),
          created_at: user.getCreatedAt(),
          updated_at: user.getUpdatedAt(),
        })
        .returning();

      return ok(this.toEntity(newUser[0]));
    } catch (error) {
      return failure("Failed to create user");
    }
  }

  async fetchById(id: string): Promise<Either<string, User | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .execute();
      return ok(result[0] ? this.toEntity(result[0]) : null);
    } catch (error) {
      return failure("Failed to fetch user by ID");
    }
  }

  async fetchByUsername(
    username: string
  ): Promise<Either<string, User | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute();
      return ok(result[0] ? this.toEntity(result[0]) : null);
    } catch (error) {
      return failure("Failed to fetch user by username");
    }
  }

  async fetchByEmail(email: string): Promise<Either<string, User | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();
      return ok(result[0] ? this.toEntity(result[0]) : null);
    } catch (error) {
      return failure("Failed to fetch user by email");
    }
  }

  async fetchAll(): Promise<Either<string, User[]>> {
    try {
      const allUsers = await db.select().from(users).execute();
      return ok(allUsers.map(this.toEntity));
    } catch (error) {
      return failure("Failed to fetch users");
    }
  }

  async update(user: User): Promise<Either<string, User | null>> {
    try {
      const updatedUser = await db
        .update(users)
        .set({
          username: user.getUsername(),
          email: user.getEmail(),
          password: user.getHashedPassword(),
          role: user.getRole(),
          updated_at: new Date(),
        })
        .where(eq(users.id, user.getId()))
        .returning()
        .execute();

      return updatedUser[0]
        ? ok(this.toEntity(updatedUser[0]))
        : failure("User not found for update");
    } catch (error) {
      return failure("Failed to update user");
    }
  }
  async remove(id: string): Promise<Either<string, boolean>> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).execute();

      // Explicitly check for rowCount with nullish coalescing operator
      return (result?.rowCount ?? 0) > 0
        ? ok(true)
        : failure("User not found for deletion");
    } catch (error) {
      return failure("Failed to delete user");
    }
  }

  async fetchUserRole(userId: string): Promise<Either<string, string>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();
      return ok(result[0]?.role || "");
    } catch (error) {
      return failure("Failed to fetch user role");
    }
  }

  // Helper to convert raw database row to User entity
  private toEntity(row: any): User {
    return new User(
      row.username,
      row.email,
      row.password,
      row.role,
      row.id,
      row.created_at,
      row.updated_at
    );
  }
}
