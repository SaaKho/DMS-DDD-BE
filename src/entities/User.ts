import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../drizzle/schema";

export class User {
  private readonly id: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private password: string;
  private role: UserRole;

  constructor(
    private readonly username: string,
    private readonly email: string,
    password: string,
    role: UserRole = UserRole.User,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id || uuidv4(); // UUID generated here
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.email.includes("@")) {
      throw new Error("Invalid email format.");
    }
    if (this.username.trim() === "") {
      throw new Error("Username cannot be empty.");
    }
    if (this.password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    if (!Object.values(UserRole).includes(this.role)) {
      throw new Error("Invalid user role.");
    }
  }

  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Retrieve hashed password securely
  getHashedPassword(): string {
    return this.password;
  }

  updatePassword(newPassword: string): void {
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
