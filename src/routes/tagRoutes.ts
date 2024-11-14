// routes/tagRoutes.ts
import express from "express";
import TagController from "../controller/tagController";

const router = express.Router();

router.get("/getAllTags", TagController.getAllTags);
router.post("/createTag", TagController.createTag);
router.put("/update/:id", TagController.updateTag);
router.delete("/deleteTag/:id", TagController.deleteTag);
router.get("/paginate", TagController.getPaginatedTags);

export default router;
