import { Request, Response } from "express";
import ServiceProduct from "../services/product";

class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const data = req.body;
      const image = req.file;
      const product = await ServiceProduct.createProduct(data, image);
      res.status(201).json(product);
    } catch (err: any) {
      if (err.validCategories || err.validSuppliers) {
        res.status(400).json({
          error: err.message,
          validCategories: err.validCategories,
          validSuppliers: err.validSuppliers,
        });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  }

  async getAllProducts(_req: Request, res: Response) {
    try {
      const products = await ServiceProduct.getAllProducts();
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.product_id);
      const product = await ServiceProduct.getProductById(product_id);
      res.json(product);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.product_id);
      const data = req.body;
      const image = req.file;
      const updatedProduct = await ServiceProduct.updateProduct(
        product_id,
        data,
        image
      );
      res.json({ message: "Product updated successfully", updatedProduct });
    } catch (err: any) {
      if (err.validCategories || err.validSuppliers) {
        res.status(400).json({
          error: err.message,
          validCategories: err.validCategories,
          validSuppliers: err.validSuppliers,
        });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.product_id);
      await ServiceProduct.deleteProduct(product_id);
      res.json({ message: "Product deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  async searchProducts(req: Request, res: Response) {
    try {
      const name =req.query.name as string;
      const products = await ServiceProduct.searchProductsByName(name);
      res.json(products); return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  async getProductsByCategory(req: Request, res: Response) {
    const category_id = Number(req.params.category_id);
    try {
      const products = await ServiceProduct.getProductsByCategory(category_id);
      res.json(products); return;
    } catch (error) {
      res.status(500).json({ message: error }); 
    }
  }
  async getProductsByStatus(req: Request, res: Response) {
    try {
      // Lấy query string ?is_active=true hoặc false
      const { is_active } = req.query;

      // Chuyển đổi string "true"/"false" thành boolean
      const isActiveBool = is_active === "true";

      const products = await ServiceProduct.getProductsByStatus(isActiveBool);
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  async filterByPrice(req: Request, res: Response) {
    try {
      const min = req.query.min ? Number(req.query.min) : undefined;
      const max = req.query.max ? Number(req.query.max) : undefined;

      const products = await ServiceProduct.filterProductsByPrice(min, max);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async countAll(req: Request, res: Response) {
    try {
      const count = await ServiceProduct.countAllProducts();
      res.status(200).json(count);
    } catch (error) {
      console.error('Error counting all products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async filterAndSortProducts(req: Request, res: Response): Promise<void> {
    try {
      const { minPrice, maxPrice, sortBy, sortOrder, isActive } = req.query;

      if (
        sortBy &&
        !["price", "name", "newest", "promotion", "featured"].includes(sortBy as string)
      ) {
        res.status(400).json({ error: "Invalid sortBy value" });
        return;
      }

      if (sortOrder && !["ASC", "DESC"].includes(sortOrder as string)) {
        res.status(400).json({ error: "Invalid sortOrder value" });
        return;
      }

      if (isActive && !["true", "false", "1", "0"].includes((isActive as string).toLowerCase())) {
        res.status(400).json({ error: "isActive must be 'true', 'false', '1', or '0'" });
        return;
      }

      if (
        (minPrice && isNaN(Number(minPrice))) ||
        (maxPrice && isNaN(Number(maxPrice)))
      ) {
        res.status(400).json({ error: "Invalid minPrice or maxPrice value" });
        return;
      }

      const products = await ServiceProduct.filterAndSortProducts({
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as "price" | "name" | "newest" | "promotion" | "featured" | undefined,
        sortOrder: sortOrder as "ASC" | "DESC" | undefined,
        isActive:
          isActive === undefined
            ? true
            : ["true", "1"].includes((isActive as string).toLowerCase()),
      });

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProductController();
