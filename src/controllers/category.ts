import { Request, Response } from "express";
import ServiceCategory from "../services/category";

class CategoryController {
  // Tạo category mới
  async createCategory(req: Request, res: Response) {
    try {
      const data = req.body;
      const category = await ServiceCategory.createCategory(data);
      res.status(201).json(category);
    } catch (err: any) {
      if (err.validCategories) {
        res.status(400).json({
          error: err.message,
          validCategories: err.validCategories,
        });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  }

  // Lấy tất cả category
  async getAllCategories(_req: Request, res: Response) {
    try {
      const categories = await ServiceCategory.getAllCategories();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Lấy category theo ID
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const category_id = Number(req.params.category_id);
      const category = await ServiceCategory.getCategoryById(category_id);
      res.json(category);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Cập nhật category
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const category_id = Number(req.params.category_id);
      const data = {
        ...req.body,
        parent_id: req.body.parent_id ? Number(req.body.parent_id) : null,
      };
      const category = await ServiceCategory.updateCategory(category_id, data);
      res.json({ message: "Update category successfull", category });
    } catch (err: any) {
      if (err.validCategories) {
        res.status(400).json({
          error: err.message,
          validCategories: err.validCategories,
        });
        return;
      }
      res.status(500).json({ error: err.message });
      return;
    }
  }

  // Xóa category
  async deleteCategory(req: Request, res: Response) {
    try {
      const category_id = Number(req.params.category_id);
      await ServiceCategory.deleteCategory(category_id);
      res.json({ message: "Category deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CategoryController();
