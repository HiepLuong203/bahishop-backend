import express from "express";
import CartItemController from "../controllers/cartItem";
import authenticateToken from "../middlewares/authentication";
const router = express.Router();

router.get("/mycart", authenticateToken, CartItemController.getCart);
router.post("/", authenticateToken, CartItemController.addToCart);
router.delete(
  "/:product_id",
  authenticateToken,
  CartItemController.removeFromCart
);
router.put("/update", authenticateToken, CartItemController.updateQuantity);
export default router;
