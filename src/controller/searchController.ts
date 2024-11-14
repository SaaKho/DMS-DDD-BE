// controllers/SearchController.ts
import { Request, Response } from "express";
import { SearchService } from "../services/searchService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const searchService = new SearchService();

class SearchController {
  static async searchDocuments(req: AuthenticatedRequest, res: Response) {
    const filters = req.query;

    const result: any = await searchService.searchDocuments(filters);

    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }

    res.status(200).json({ documents: result.value });
  }
}

export default SearchController;
