import { Request, Response } from "express";
import CartItemService from "../services/cartItem";

class CartItemController {
  async getCart(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.id;
      const items = await CartItemService.getCartItemsByUser(user_id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as any).user.id;
      const { product_id, quantity } = req.body;

      const item = await CartItemService.addToCartItem(user_id, {
        user_id,
        product_id,
        quantity: quantity ?? 1,
      });

      res.status(200).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  
  async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as any).user.id;
      const { product_id, quantity } = req.body;

      const result = await CartItemService.updateCartItemQuantity(user_id, product_id, quantity);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeFromCart(req: Request, res: Response) {
    const user_id = (req as any).user.id;
    const product_id = Number(req.params.product_id);
    await CartItemService.removeCartItem(user_id, product_id);
    res.json({ message: "Item removed from cart" });
  }
}

export default new CartItemController();
