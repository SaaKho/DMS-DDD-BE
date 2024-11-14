import { IUserRepository } from "../interfaces/IUserRepository";
import { db, users } from "../../drizzle/schema";
import { UserRole } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { Either, ok, failure } from "../../utils/monads";
import { v4 as uuidv4 } from "uuid";

export class UserRepository implements IUserRepository {
  async add(
    username: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<Either<string, any>> {
    try {
      const newUser = await db
        .insert(users)
        .values({
          id: uuidv4(),
          username,
          email,
          password,
          role,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();
      return ok(newUser[0]);
    } catch (error) {
      return failure("Failed to create user");
    }
  }

  async fetchByEmail(email: string): Promise<Either<string, any | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();
      return ok(result[0] || null);
    } catch (error) {
      return failure("Failed to fetch user by email");
    }
  }

  async fetchById(id: string): Promise<Either<string, any | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .execute();
      return ok(result[0] || null);
    } catch (error) {
      return failure("Failed to fetch user by ID");
    }
  }

  async fetchByUsername(username: string): Promise<Either<string, any | null>> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .execute();
      return ok(result[0] || null);
    } catch (error) {
      return failure("Failed to fetch user by username");
    }
  }

  async update(
    id: string,
    username?: string,
    email?: string,
    password?: string,
    role?: UserRole
  ): Promise<Either<string, any | null>> {
    try {
      const updatedUser = await db
        .update(users)
        .set({
          username,
          email,
          password,
          role,
          updated_at: new Date(),
        })
        .where(eq(users.id, id))
        .returning()
        .execute();
      return ok(updatedUser[0] || null);
    } catch (error) {
      return failure("Failed to update user");
    }
  }

  async remove(id: string): Promise<Either<string, boolean>> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).execute();
      return ok(result?.rowCount ? result.rowCount > 0 : false);
    } catch (error) {
      return failure("Failed to delete user");
    }
  }
  async fetchAll(): Promise<Either<string, any[]>> {
    try {
      const allUsers = await db.select().from(users).execute();
      return ok(allUsers);
    } catch (error) {
      return failure("Failed to fetch users");
    }
  }
}
