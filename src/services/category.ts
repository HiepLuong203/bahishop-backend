import Category from "../models/category";
import { CategoryAttributes } from "../types/category";
export default class ServiceCategory {
  // Thêm category
  static async createCategory(data: Partial<CategoryAttributes>) {
    await this.validateParentId(data.parent_id ?? null);
    return Category.create(data);
  }

  // Lấy tất cả category + subcategories
  static async getAllCategories() {
    return Category.findAll({
      include: [
        {
          model: Category,
          as: "subcategories",
          include: [
            {
              model: Category,
              as: "subcategories",
            },
          ],
        },
      ],
    });
  }

  // Lấy category theo ID
  static async getCategoryById(category_id: number) {
    const category = await Category.findByPk(category_id, {
      include: [
        {
          model: Category,
          as: "subcategories",
          include: [
            {
              model: Category,
              as: "subcategories",
            },
          ],
        },
      ],
    });
    if (!category) throw new Error("Category not found");
    return category;
  }

  // Cập nhật category
  static async updateCategory(
    category_id: number,
    data: Partial<CategoryAttributes>
  ) {
    await this.validateParentId(data.parent_id ?? null);
    const category = await Category.findByPk(category_id);
    if (!category) throw new Error("Category not found");
    await category.update(data);
    return category;
  }

  // Xoá category
  static async deleteCategory(category_id: number) {
    const category = await Category.findByPk(category_id);
    if (!category) throw new Error("Category not found");
    await category.destroy();
    return category;
  }
  // Check category_id
  static async validateCategoryId(category_id: number | null) {
    if (!category_id) return;

    const category = await Category.findByPk(category_id);
    if (!category) {
      const validCategories = await Category.findAll({
        attributes: ["category_id", "name"],
      });
      const error: any = new Error("category_id không hợp lệ");
      error.validCategories = validCategories;
      throw error;
    }
  }
  // Check parent_id có tồn tại không
  static async validateParentId(parent_id: number | null) {
    if (!parent_id) return;

    const parentCategory = await Category.findByPk(parent_id);
    if (!parentCategory) {
      const validCategories = await Category.findAll({
        attributes: ["category_id", "name"],
      });
      const error: any = new Error("parent_id không hợp lệ");
      error.validCategories = validCategories;
      throw error;
    }
  }
}
