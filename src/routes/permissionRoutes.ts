// permissionRoutes.ts
import express from "express";
import PermissionsController from "../controller/permissionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Grant permission (Admin or Owner only)
router.post("/grant", authMiddleware, PermissionsController.grantPermission);

// Revoke permission (Admin or Owner only)
router.post("/revoke", authMiddleware, PermissionsController.revokePermission);

export default router;
