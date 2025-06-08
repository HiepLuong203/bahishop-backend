import { Router } from "express";
import ProductPromotionController from "../controllers/productPromotion";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/", authenticateToken, ProductPromotionController.applyPromotion);

router.delete("/:product_promotion_id", authenticateToken, ProductPromotionController.removePromotion);

router.get("/", ProductPromotionController.getAllProductPromotions);

export default router;
