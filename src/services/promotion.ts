import Promotion from "../models/promotion";
import { PromotionAttributes } from "../types/promotion";

export default class ServicePromotion {
  static async createPromotion(data: Partial<PromotionAttributes>) {
    return Promotion.create(data);
  }

  static async getAllPromotions() {
    return Promotion.findAll();
  }

  static async getPromotionById(promotion_id: number) {
    const promotion = await Promotion.findByPk(promotion_id);
    if (!promotion) throw new Error("Promotion not found");
    return promotion;
  }

  static async updatePromotion(
    promotion_id: number,
    data: Partial<PromotionAttributes>
  ) {
    const promotion = await Promotion.findByPk(promotion_id);
    if (!promotion) throw new Error("Promotion not found");
    await promotion.update(data);
    return promotion;
  }
  static async deletePromotion(promotion_id: number) {
    const promotion = await Promotion.findByPk(promotion_id);
    if (!promotion) throw new Error("Promotion not found");
    await promotion.destroy();
    return promotion;
  }
}
