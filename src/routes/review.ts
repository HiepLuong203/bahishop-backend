import { Router } from "express";
import ReviewController from "../controllers/review";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/", authenticateToken, ReviewController.createReview);

router.put("/:review_id", authenticateToken, ReviewController.updateReview);

router.delete("/:review_id", authenticateToken, ReviewController.deleteReview);

router.get("/:product_id/count", ReviewController.countReviewsByProduct);

router.get("/product/:product_id", ReviewController.getReviewsByProduct);
export default router;
