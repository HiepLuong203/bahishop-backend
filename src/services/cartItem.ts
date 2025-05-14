import CartItem from "../models/cartItem";
import User from "../models/user";
import { CartItemInput } from "../types/cartItem";
import Product from "../models/product";
export default class CartItemService {
  static async getCartItemsByUser(user_id: number) {
    try {
      return await CartItem.findAll({
        where: { user_id: user_id },
        include: [
          {
            model: Product,
            as: "product",
            attributes: [
              "product_id",
              "name",
              "price",
              "discount_price",
              "stock_quantity",
              "unit",
            ],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }
  static async addOrUpdateCartItem(user_id: number, data: CartItemInput) {
    // 🔒 Kiểm tra tài khoản đã active chưa
    const user = await User.findByPk(user_id);
    if (!user || !user.is_active) {
      throw new Error(
        "Tài khoản chưa được kích hoạt. Vui lòng xác thực email."
      );
    }

    // 💡 Thêm hoặc cập nhật item vào giỏ hàng
    let cartItem = await CartItem.findOne({
      where: { user_id, product_id: data.product_id },
    });

    if (cartItem) {
      cartItem.quantity += data.quantity ?? 0;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        user_id,
        product_id: data.product_id,
        quantity: data.quantity,
      });
    }

    return cartItem;
  }
  static async getCartItem(user_id: number, product_id: number) {
    return await CartItem.findOne({
      where: { user_id, product_id },
      include: [{ model: Product, as: "product" }],
    });
  }

  static async removeCartItem(user_id: number, productId: number) {
    return await CartItem.destroy({
      where: { user_id: user_id, product_id: productId },
    });
  }
}
