import { Router } from "express";
import PromotionController from "../controllers/promotion";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/",authenticateToken, PromotionController.createPromotion);
router.get("/", PromotionController.getAllPromotions);
router.get("/:promotion_id", PromotionController.getPromotionById);
router.put("/:promotion_id",authenticateToken, PromotionController.updatePromotion);
router.delete("/:promotion_id",authenticateToken, PromotionController.deletePromotion);

export default router;
