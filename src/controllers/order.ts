import { Request, Response } from "express";
import CartItemService from "../services/cartItem";
import ServiceOrder from "../services/order";

class OrderController {
  async checkoutAll(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as any).user.id;
      const cartItems = await CartItemService.getCartItemsByUser(user_id);
      if (!cartItems.length) {
        res.status(400).json({ message: "Giỏ hàng rỗng" });
        return;
      }

      const items = cartItems.map((item: any) => {
        const price = item.product.discount_price ?? item.product.price;
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product.price,
          discount_price: item.product.discount_price,
          total_price: item.quantity * price,
        };
      });

      const order = await ServiceOrder.createOrder(user_id, req.body, items);

      for (const item of cartItems) {
        await CartItemService.removeCartItem(user_id, item.product_id);
      }

      res.json({ message: "Đặt hàng thành công", order });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  async checkoutSingle(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as any).user.id;
      const product_id = Number(req.params.product_id);

      const cartItem = await CartItemService.getCartItem(user_id, product_id);

      if (!cartItem) {
        res
          .status(404)
          .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        return;
      }

      if (!cartItem.product) {
        res.status(400).json({ message: "Thông tin sản phẩm không hợp lệ" });
        return;
      }
      const price = cartItem.product.discount_price ?? cartItem.product.price;
      const item = {
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        unit_price: cartItem.product.price,
        discount_price: cartItem.product.discount_price,
        total_price: cartItem.quantity * price,
      };

      const order = await ServiceOrder.createOrder(user_id, req.body, [item]);

      await CartItemService.removeCartItem(user_id, product_id);

      res.json({ message: "Đặt hàng thành công", order });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
}

export default new OrderController();
