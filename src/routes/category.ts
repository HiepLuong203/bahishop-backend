import { Router } from "express";
import CategoryController from "../controllers/category";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getAllCategories);
router.get("/:category_id", CategoryController.getCategoryById);
router.put("/:category_id", CategoryController.updateCategory);
router.delete("/:category_id", CategoryController.deleteCategory);

export default router;
