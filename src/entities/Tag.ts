// src/entities/Tag.ts
import { v4 as uuidv4 } from "uuid";

export class Tag {
  private readonly id: string;
  private name: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(name: string, id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id || uuidv4();
    this.name = name;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (this.name.trim() === "") {
      throw new Error("Tag name cannot be empty.");
    }
    if (this.name.length > 50) {
      throw new Error("Tag name cannot exceed 50 characters.");
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Method to update the tag name
  updateName(newName: string): void {
    if (newName.trim() === "") {
      throw new Error("Tag name cannot be empty.");
    }
    if (newName.length > 50) {
      throw new Error("Tag name cannot exceed 50 characters.");
    }
    this.name = newName;
    this.updatedAt = new Date();
  }
}
