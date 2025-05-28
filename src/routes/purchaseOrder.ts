import { Router } from "express";
import PurchaseOrderController from "../controllers/purchaseOrder";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.get("/", PurchaseOrderController.getAllPurchaseOrders);
router.get("/filterbydate", PurchaseOrderController.getPurchaseOrdersByDate);
router.get("/:id", PurchaseOrderController.getPurchaseOrderById);
router.post("/",authenticateToken, PurchaseOrderController.createPurchaseOrder);
router.put("/:id",authenticateToken, PurchaseOrderController.updatePurchaseOrder);

export default router;
