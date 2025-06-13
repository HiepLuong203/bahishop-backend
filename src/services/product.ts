import { Op } from "sequelize";
import Product from "../models/product";
import Category from "../models/category";
import { ProductAttributes } from "../types/product";
import ServiceCategory from "../services/category";
import ServiceSupplier from "../services/supplier";
import ProductImage from "../models/productImage";
import Supplier from "../models/supplier";
export default class ServiceProduct {
  //tạo sản phẩm
  static async createProduct(
    data: Partial<ProductAttributes>,
    imageFile?: Express.Multer.File
  ) {
    await ServiceCategory.validateCategoryId(data.category_id ?? null);
    await ServiceSupplier.validateSupplierId(data.supplier_id ?? null); 
    if (imageFile) {
      data.image_url = `/uploads/${imageFile.filename}`;
    }
    return Product.create(data);
  }
  //lấy tất cả sản phẩm
  static async getAllProducts() {
    return Product.findAll({
      include: [
        { model: Category, as: "category" },
        { model: Supplier, as: "supplier", attributes: ["supplier_id", "name"] },
      ],
    });
  }

  static async getProductById(product_id: number) {
    const product = await Product.findByPk(product_id, {
      include: [
        { model: Category, as: "category" },
        {
          model: ProductImage,
          as: "images",
          separate: true,
          order: [["display_order", "ASC"]],
        },
        { model: Supplier, as: "supplier" },
      ],
    });
    if (!product) throw new Error("Product not found");
    return product;
  }
  static async searchProductsByName(name: string) {
    try {
      return await Product.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
          is_active: true, // Thêm điều kiện is_active = true
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching products by name");
    }
  }

  static async getProductsByCategory(category_id: number) {
    return Product.findAll({
      where: { category_id: category_id, is_active: true },
    });
  }
  static async getProductsByStatus(is_active: boolean) {
    return Product.findAll({
      where: { is_active: is_active },
    });
  }
  static async updateProduct(
    product_id: number,
    data: Partial<ProductAttributes>,
    imageFile?: Express.Multer.File
  ) {
    await ServiceCategory.validateCategoryId(data.category_id ?? null);
    await ServiceSupplier.validateSupplierId(data.supplier_id ?? null); 
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error("Product not found");
    if (imageFile) {
      data.image_url = `/uploads/${imageFile.filename}`;
    }
    await product.update(data);
    return product;
  }

  static async deleteProduct(product_id: number) {
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error("Product not found");
    await product.destroy();
    return product;
  }

  // Check product_id
  static async validateProductId(product_id: number | null) {
    if (!product_id) return;

    const product = await Product.findByPk(product_id);
    if (!product) {
      const validProducts = await Product.findAll({
        attributes: ["product_id", "name"],
      });
      const error: any = new Error("product_id không hợp lệ");
      error.validProducts = validProducts;
      throw error;
    }
  }
  
  static async filterProductsByPrice(minPrice?: number, maxPrice?: number) {
    const whereCondition: any = {
      is_active: true,
    };

    if (minPrice !== undefined && maxPrice !== undefined) {
      whereCondition.price = {
        [Op.between]: [minPrice, maxPrice],
      };
    } else if (minPrice !== undefined) {
      whereCondition.price = {
        [Op.gte]: minPrice,
      };
    } else if (maxPrice !== undefined) {
      whereCondition.price = {
        [Op.lte]: maxPrice,
      };
    }

    return Product.findAll({ where: whereCondition });
  }
  static async countAllProducts() {
    const [total, activeCount, inactiveCount] = await Promise.all([
      Product.count({
        distinct: true,
        col: 'product_id',
      }),
      Product.count({
        where: {
          is_active: true,
        },
        distinct: true,
        col: 'product_id',
      }),
      Product.count({
        where: {
          is_active: false,
        },
        distinct: true,
        col: 'product_id',
      }),
    ]);
    return {total, activeCount, inactiveCount  };
  }
  static async filterAndSortProducts({
    minPrice,
    maxPrice,
    sortBy = "name",
    sortOrder = "ASC",
    isActive = true,
  }: {minPrice?: number;
      maxPrice?: number;
      sortBy?: "price" | "name" | "newest" | "promotion" | "featured";
      sortOrder?: "ASC" | "DESC";
      isActive?: boolean;}) {
    const whereCondition: any = {};

    // Lọc sản phẩm đang hoạt động
    if (isActive !== undefined) {
      whereCondition.is_active = isActive;
    }

    // Lọc theo giá
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereCondition.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice !== undefined) {
      whereCondition.price = { [Op.gte]: minPrice };
    } else if (maxPrice !== undefined) {
      whereCondition.price = { [Op.lte]: maxPrice };
    }

    // Các filter đặc biệt
    if (sortBy === "newest") {
      whereCondition.is_new = true;
    }

    if (sortBy === "featured") {
      whereCondition.is_featured = true;
    }

    if (sortBy === "promotion") {
      whereCondition.discount_price = { [Op.ne]: null };
    }

    // Sắp xếp
    let sortOption: any[] = [];
    switch (sortBy) {
      case "price":
        sortOption = [["price", sortOrder]];
        break;
      case "name":
        sortOption = [["name", sortOrder]];
        break;
      case "newest":
        sortOption = [["createdAt", sortOrder]];
        break;
      case "promotion":
        sortOption = [["discount_price", sortOrder]];
        break;
      case "featured":
        sortOption = [["createdAt", sortOrder]];
        break;
      default:
        sortOption = [["name", "ASC"]];
    }

    try {
      const products = await Product.findAll({
        where: whereCondition,
        order:sortOption,
        include: [
          { model: Category, as: "category" },
          { model: Supplier, as: "supplier", attributes: ["supplier_id", "name"] },
          {
            model: ProductImage,
            as: "images",
            separate: true,
            order: [["display_order", "ASC"]],
          },
        ],
      });

      return products;
    } catch (error: any) {
      throw new Error(`Lỗi khi lọc và sắp xếp sản phẩm: ${error.message}`);
    }
  }
}
