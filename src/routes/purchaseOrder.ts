import { Router } from "express";
import PurchaseOrderController from "../controllers/purchaseOrder";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.get("/", PurchaseOrderController.getAllPurchaseOrders);
router.get("/:id", PurchaseOrderController.getPurchaseOrderById);
router.post("/", PurchaseOrderController.createPurchaseOrder);
router.put("/:id", PurchaseOrderController.updatePurchaseOrder);

export default router;
