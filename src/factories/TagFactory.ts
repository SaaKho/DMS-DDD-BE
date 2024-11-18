// src/factories/TagFactory.ts
import { Tag } from "../entities/Tag";

export class TagFactory {
  static create(name: string): Tag {
    return new Tag(name);
  }
}
