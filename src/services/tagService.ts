// services/TagService.ts
import { ITagRepository } from "../repositories/interfaces/ITagRepository";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";
import { Pagination } from "../utils/Pagination";

export class TagService {
  private tagRepository: ITagRepository;
  private logger: Logger;

  constructor(tagRepository: ITagRepository, logger: Logger) {
    this.tagRepository = tagRepository;
    this.logger = logger;
  }

  async getAllTags(): Promise<Either<string, any[]>> {
    this.logger.log("Fetching all tags");
    return await this.tagRepository.fetchAll();
  }

  async createTag(name: string): Promise<Either<string, any>> {
    if (!name) return failure("Tag name is required");
    this.logger.log(`Creating tag with name: ${name}`);
    return await this.tagRepository.add(name);
  }

  async updateTag(
    id: string,
    name: string
  ): Promise<Either<string, any | null>> {
    if (!name) return failure("Tag name is required");
    this.logger.log(`Updating tag with id: ${id} and name: ${name}`);
    return await this.tagRepository.update(id, name);
  }

  async deleteTag(id: string): Promise<Either<string, boolean>> {
    this.logger.log(`Deleting tag with id: ${id}`);
    return await this.tagRepository.remove(id);
  }
  async getPaginatedTags(
    page: number,
    limit: number
  ): Promise<Either<string, any>> {
    const usersResult: any = await this.tagRepository.fetchAll();
    if (usersResult.isFailure()) {
      return failure(usersResult.value);
    }

    const users = usersResult.value;
    const pagination = new Pagination(users, users.length, page, limit);
    const paginatedData = pagination.getPaginatedData();

    return ok(paginatedData);
  }
}
