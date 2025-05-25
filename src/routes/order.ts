import express from "express";
import authenticateToken from "../middlewares/authentication";
import OrderController from "../controllers/order";

const router = express.Router();

router.get("/", authenticateToken, OrderController.getAllOrders);
router.get("/count-all-orders", authenticateToken, OrderController.countAll);
router.post("/checkout", authenticateToken, OrderController.checkoutAll);
router.post(
  "/checkout/:product_id",
  authenticateToken,
  OrderController.checkoutSingle
);
router.post("/:order_id/cancel",authenticateToken, OrderController.cancelOrder);
export default router;
