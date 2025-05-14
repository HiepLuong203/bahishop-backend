import { Router } from "express";
import PromotionController from "../controllers/promotion";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/", PromotionController.createPromotion);
router.get("/", PromotionController.getAllPromotions);
router.get("/:promotion_id", PromotionController.getPromotionById);
router.put("/:promotion_id", PromotionController.updatePromotion);
router.delete("/:promotion_id", PromotionController.deletePromotion);

export default router;
