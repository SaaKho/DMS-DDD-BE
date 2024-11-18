import express from "express";
import { AuthMiddleware, authorizeRole } from "../middleware/authMiddleware";
import UserController from "../controller/userController";

const router = express.Router();

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);
router.put(
  "/update/:id",
  AuthMiddleware,
  authorizeRole("Admin"),
  UserController.updateUser
);
router.delete(
  "/deleteUser/:id",
  AuthMiddleware,
  authorizeRole("Admin"),
  UserController.deleteUser
);
router.get("/paginate", UserController.getPaginatedUsers);

export default router;
