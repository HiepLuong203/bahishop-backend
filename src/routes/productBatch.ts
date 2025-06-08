// src/routes/productBatch.ts

import { Router } from "express";
import ProductBatchController from "../controllers/productBatch";
import authenticateToken from "../middlewares/authentication"; 

const router = Router();

router.get("/", authenticateToken, ProductBatchController.getBatches);

router.get("/expiring", authenticateToken, ProductBatchController.getExpiringBatches);

router.get("/:id", authenticateToken, ProductBatchController.getBatchById);

router.put("/:id/status", authenticateToken, ProductBatchController.updateBatchStatus);

router.put("/:id/adjust-quantity", authenticateToken, ProductBatchController.adjustBatchQuantity);

router.post("/update-expired", authenticateToken, ProductBatchController.updateExpiredBatches);


export default router;