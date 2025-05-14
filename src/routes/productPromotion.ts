import { Router } from "express";
import ProductPromotionController from "../controllers/productPromotion";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/", ProductPromotionController.applyPromotion);
router.delete(
  "/:product_promotion_id",
  ProductPromotionController.removePromotion
);
router.get("/", ProductPromotionController.getAllProductPromotions);

export default router;
