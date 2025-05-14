import express from "express";
import authenticateToken from "../middlewares/authentication";
import OrderController from "../controllers/order";

const router = express.Router();

router.post("/checkout", authenticateToken, OrderController.checkoutAll);
router.post(
  "/checkout/:product_id",
  authenticateToken,
  OrderController.checkoutSingle
);

export default router;
