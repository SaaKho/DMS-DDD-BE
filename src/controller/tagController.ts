// controllers/TagController.ts
import { Request, Response } from "express";
import { TagService } from "../services/tagService";
import { TagRepository } from "../repositories/implementations/tagRepository";
import { ConsoleLogger } from "../logging/console.logger";
import { tagSchema } from "../validation/tagValidation";

const logger = new ConsoleLogger();
const tagRepository = new TagRepository();
const tagService = new TagService(tagRepository, logger);

class TagController {
  // Centralized response handler
  private static handleResponse(
    result: any,
    res: Response,
    successStatus = 200,
    successMessage?: string
  ) {
    if (result.isFailure()) {
      return res
        .status(result.value.includes("not found") ? 404 : 500)
        .json({ error: result.value });
    }
    const responseContent = successMessage
      ? { message: successMessage, tag: result.value }
      : result.value;
    return res.status(successStatus).json(responseContent);
  }

  static async getAllTags(req: Request, res: Response) {
    const result = await tagService.getAllTags();
    TagController.handleResponse(result, res);
  }

  static async createTag(req: Request, res: Response) {
    const validation = tagSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { name } = req.body;
    const result = await tagService.createTag(name);
    TagController.handleResponse(result, res, 201, "Tag created successfully");
  }

  static async updateTag(req: Request, res: Response) {
    const validation = tagSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { id } = req.params;
    const { name } = req.body;
    const result = await tagService.updateTag(id, name);
    TagController.handleResponse(result, res, 200, "Tag updated successfully");
  }

  static async deleteTag(req: Request, res: Response) {
    const { id } = req.params;
    const result: any = await tagService.deleteTag(id);
    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }
    if (!result.value) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(204).json();
  }
  static async getPaginatedTags(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result: any = await tagService.getPaginatedTags(page, limit);

    if (result.isFailure()) {
      res.status(500).json({ error: result.value });
    } else {
      res.json(result.value);
    }
  }
}

export default TagController;
