import ProductPromotion from "../models/productPromotion";
import Product from "../models/product";
import Promotion from "../models/promotion";

export default class ServiceProductPromotion {
  static async applyPromotion(product_id: number, promotion_id: number) {
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error("Product not found");

    const promotion = await Promotion.findByPk(promotion_id);
    if (!promotion) throw new Error("Promotion not found");

    // Tính giá khuyến mãi
    let newPrice = product.price;
    if (promotion.discount_type === "percentage") {
      newPrice =
        Number(product.price) * (1 - Number(promotion.discount_value) / 100);
    } else if (promotion.discount_type === "fixed_amount") {
      newPrice = Number(product.price) - Number(promotion.discount_value);
    }
    if (newPrice < 0) newPrice = 0; // Không để giá âm

    // Cập nhật giá discount_price của sản phẩm
    await product.update({
      discount_price: newPrice, // Cập nhật discount_price
    });

    // Gán khuyến mãi cho sản phẩm
    const productPromotion = await ProductPromotion.create({
      product_id,
      promotion_id,
    });

    return { productPromotion, updatedDiscountPrice: newPrice };
  }

  static async removePromotion(product_promotion_id: number) {
    const record = await ProductPromotion.findByPk(product_promotion_id);
    if (!record) throw new Error("Product Promotion not found");

    const product = await Product.findByPk(record.product_id);
    if (product) {
      // Nếu remove promotion, reset lại giá khuyến mãi (về null)
      await product.update({ sale_price: null });
    }

    await record.destroy();
    return record;
  }

  static async getAllProductPromotions() {
    return ProductPromotion.findAll({ include: [Product, Promotion] });
  }
}
