// services/TagService.ts
import { ITagRepository } from "../repositories/interfaces/ITagRepository";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";
import { Pagination } from "../utils/Pagination";
import { Tag } from "../entities/Tag";
import { TagFactory } from "../factories/TagFactory";

export class TagService {
  private tagRepository: ITagRepository;
  private logger: Logger;

  constructor(tagRepository: ITagRepository, logger: Logger) {
    this.tagRepository = tagRepository;
    this.logger = logger;
  }

  async getAllTags(): Promise<Either<string, Tag[]>> {
    this.logger.log("Fetching all tags");
    return await this.tagRepository.fetchAll();
  }

  async createTag(name: string): Promise<Either<string, Tag>> {
    if (!name.trim()) {
      return failure("Tag name is required");
    }

    this.logger.log(`Creating tag with name: ${name}`);
    const tag = TagFactory.create(name); // Create a Tag entity

    return await this.tagRepository.add(tag); // Pass the entity to the repository
  }

  async updateTag(id: string, name: string): Promise<Either<string, Tag>> {
    if (!name.trim()) {
      return failure("Tag name is required");
    }

    this.logger.log(`Updating tag with id: ${id} and name: ${name}`);

    // Fetch the tag by ID
    const tagResult = await this.tagRepository.fetchById(id);

    if (tagResult.isFailure()) {
      return failure(tagResult.value); // Return the error if the fetch fails
    }

    const existingTag = tagResult.value;
    if (!existingTag) {
      return failure("Tag not found"); // Handle the case where no tag is found
    }

    // Update tag name and timestamp
    existingTag.updateName(name);

    // Save the updated tag to the repository
    const updateResult = await this.tagRepository.update(existingTag);
    if (updateResult.isFailure() || !updateResult.value) {
      return failure("Failed to update tag");
    }
    return ok(updateResult.value);
  }

  async deleteTag(id: string): Promise<Either<string, boolean>> {
    this.logger.log(`Deleting tag with id: ${id}`);

    // Fetch the tag by ID to ensure it exists before deletion
    const tagResult = await this.tagRepository.fetchById(id);

    if (tagResult.isFailure() || !tagResult.value) {
      return failure("Tag not found");
    }

    const tagToDelete = tagResult.value;

    // Remove the tag
    return await this.tagRepository.remove(tagToDelete);
  }

  async getPaginatedTags(
    page: number,
    limit: number
  ): Promise<Either<string, Pagination<Tag>>> {
    this.logger.log(
      `Fetching paginated tags for page: ${page}, limit: ${limit}`
    );

    // Fetch all tags
    const tagsResult = await this.tagRepository.fetchAll();
    if (tagsResult.isFailure()) {
      return failure(tagsResult.value);
    }

    const tags = tagsResult.value;

    // Apply pagination
    const pagination = new Pagination(tags, tags.length, page, limit);
    return ok(pagination);
  }
}
