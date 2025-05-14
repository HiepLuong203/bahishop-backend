import { Request, Response } from "express";
import ServiceProductPromotion from "../services/productPromotion";

class ProductPromotionController {
  async applyPromotion(req: Request, res: Response) {
    try {
      const { product_id, promotion_id } = req.body;
      const result = await ServiceProductPromotion.applyPromotion(
        product_id,
        promotion_id
      );
      res
        .status(201)
        .json({ message: "Promotion applied successfully", result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async removePromotion(req: Request, res: Response) {
    try {
      const product_promotion_id = Number(req.params.product_promotion_id);
      const result = await ServiceProductPromotion.removePromotion(
        product_promotion_id
      );
      res.json({ message: "Promotion removed successfully", result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAllProductPromotions(_req: Request, res: Response) {
    try {
      const list = await ServiceProductPromotion.getAllProductPromotions();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new ProductPromotionController();
