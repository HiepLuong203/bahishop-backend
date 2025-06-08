import express from "express";
import authenticateToken from "../middlewares/authentication";
import OrderController from "../controllers/order";

const router = express.Router();

router.get("/", authenticateToken, OrderController.getAllOrdersbyUser);

router.get("/daterange", authenticateToken, OrderController.getOrdersByDateRange);

router.get("/search/:order_id", authenticateToken, OrderController.getOrderByIdOrUserId);

router.get("/search", authenticateToken, OrderController.getOrderByIdOrUserId);

router.get("/admin-allorder", OrderController.getAllOrdersByAdmin);

router.get("/count-all-orders", authenticateToken, OrderController.countAll);

router.post("/checkout", authenticateToken, OrderController.checkoutAll);

router.post("/checkout/:product_id", authenticateToken, OrderController.checkoutSingle);

router.post("/:order_id/cancel", authenticateToken, OrderController.cancelOrder);

router.put("/admin-update-order/:order_id", OrderController.updateOrderStatusByAdmin);

router.put("/cancel-order-admin/:order_id", OrderController.cancelOrderByAdmin);
export default router;
