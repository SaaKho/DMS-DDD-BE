import express from "express";
import { authMiddleware, authorizeRole } from "../middleware/authMiddleware";
import UserController from "../controller/userController";

const router = express.Router();

router.post("/register", UserController.registerUser);

router.post("/login", UserController.loginUser);
router.put(
  "/update/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.updateUser
);
router.delete(
  "/deleteUser/:id",
  authMiddleware,
  authorizeRole("Admin"),
  UserController.deleteUser
);
router.get("/paginate", UserController.getPaginatedUsers);

export default router;
