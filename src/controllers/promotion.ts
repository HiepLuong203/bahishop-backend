import { Request, Response } from "express";
import ServicePromotion from "../services/promotion";

class PromotionController {
  async createPromotion(req: Request, res: Response) {
    try {
      const data = req.body;
      const promotion = await ServicePromotion.createPromotion(data);
      res.status(201).json(promotion);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAllPromotions(_req: Request, res: Response) {
    try {
      const promotions = await ServicePromotion.getAllPromotions();
      res.json(promotions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPromotionById(req: Request, res: Response) {
    try {
      const promotion_id = Number(req.params.promotion_id);
      const promotion = await ServicePromotion.getPromotionById(promotion_id);
      res.json(promotion);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updatePromotion(req: Request, res: Response) {
    try {
      const promotion_id = Number(req.params.promotion_id);
      const data = req.body;
      const updatedPromotion = await ServicePromotion.updatePromotion(
        promotion_id,
        data
      );
      res.json({ message: "Promotion updated successfully", updatedPromotion });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deletePromotion(req: Request, res: Response) {
    try {
      const promotion_id = Number(req.params.promotion_id);
      await ServicePromotion.deletePromotion(promotion_id);
      res.json({ message: "Promotion deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PromotionController();
