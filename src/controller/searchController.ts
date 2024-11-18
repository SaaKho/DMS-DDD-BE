import { Request, Response } from "express";
import { SearchService } from "../services/searchService";
import { ConsoleLogger } from "../logging/console.logger";

const logger = new ConsoleLogger();
const searchService = new SearchService(logger);

class SearchController {
  static async searchDocuments(req: Request, res: Response) {
    const { tags } = req.query;

    if (!tags || typeof tags !== "string") {
      return res
        .status(400)
        .json({ error: "Tags parameter is required and must be a string." });
    }

    const tagNames = tags.split(",").map((tag) => tag.trim());

    const result = await searchService.searchDocumentsByTags(tagNames);

    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }

    res.status(200).json({ documents: result.value });
  }
}

export default SearchController;
