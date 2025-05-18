import { Router } from "express";
import CategoryController from "../controllers/category";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/",authenticateToken, CategoryController.createCategory);
router.get("/", CategoryController.getAllCategories);
router.get("/:category_id",authenticateToken, CategoryController.getCategoryById);
router.put("/:category_id",authenticateToken, CategoryController.updateCategory);
router.delete("/:category_id",authenticateToken, CategoryController.deleteCategory);

export default router;
