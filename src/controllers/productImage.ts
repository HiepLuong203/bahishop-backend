import { Request, Response } from "express";
import ServiceProductImage from "../services/productImage";

class ProductImageController {
  async createProductImages(req: Request, res: Response): Promise<void> {
    try {
      const product_id = Number(req.params.product_id);
      const files = req.files as Express.Multer.File[];
      const images = await ServiceProductImage.createImagesToProduct(
        product_id,
        files
      );
      res.json({ message: "Images uploaded successfully", images });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async updateProductImage(req: Request, res: Response): Promise<void> {
    try {
      const image_id = Number(req.params.image_id);
      const data = req.body;
      const file = req.file as Express.Multer.File;
      const updatedImage = await ServiceProductImage.updateProductImage(
        image_id,
        data,
        file
      );
      res.json({ message: "Image updated successfully", updatedImage });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    try {
      const image_id = Number(req.params.image_id);
      await ServiceProductImage.deleteProductImage(image_id);
      res.json({ message: "Image deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  async getProductImagesByProduct(req: Request, res: Response): Promise<void> {
    try {
      const product_id = Number(req.params.product_id);
      const images = await ServiceProductImage.getProductImagesByProduct(product_id);
      res.json({ images });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
export default new ProductImageController();
