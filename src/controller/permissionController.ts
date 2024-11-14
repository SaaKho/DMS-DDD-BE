// controllers/PermissionsController.ts
import { Request, Response } from "express";
import { PermissionsService } from "../services/permissionService";
import { PermissionsRepository } from "../repositories/implementations/permissionRepository";
import { ConsoleLogger } from "../logging/console.logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const logger = new ConsoleLogger();
const permissionsRepository = new PermissionsRepository();
const permissionsService = new PermissionsService(
  permissionsRepository,
  logger
);

class PermissionsController {
  static async grantPermission(req: AuthenticatedRequest, res: Response) {
    const { documentId, userId, permissionType } = req.body;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId || !requesterRole) {
      return res.status(403).json({ error: "Invalid requester details" });
    }

    const result: any = await permissionsService.grantPermission(
      documentId,
      userId,
      permissionType,
      requesterId,
      requesterRole
    );

    if (result.isFailure()) {
      return res.status(403).json({ error: result.value });
    }

    res
      .status(201)
      .json({ message: "Permission granted", permission: result.value });
  }

  static async revokePermission(req: AuthenticatedRequest, res: Response) {
    const { documentId, userId } = req.body;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId || !requesterRole) {
      return res.status(403).json({ error: "Invalid requester details" });
    }

    const result = await permissionsService.revokePermission(
      documentId,
      userId,
      requesterId,
      requesterRole
    );

    if (result.isFailure()) {
      return res.status(403).json({ error: result.value });
    }

    res.status(200).json({ message: "Permission revoked" });
  }
}

export default PermissionsController;
