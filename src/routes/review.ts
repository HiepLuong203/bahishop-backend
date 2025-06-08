import { Router } from "express";
import ReviewController from "../controllers/review";
import authenticateToken from "../middlewares/authentication";

const router = Router();

// Tạo review - cần đăng nhập
router.post("/", authenticateToken, ReviewController.createReview);

// Cập nhật review - cần đăng nhập
router.put("/:review_id", authenticateToken, ReviewController.updateReview);

// Xóa review - cần đăng nhập
router.delete("/:review_id", authenticateToken, ReviewController.deleteReview);

// Lấy tất cả review theo product_id - không cần đăng nhập
router.get("/:product_id/count", ReviewController.countReviewsByProduct);
router.get("/product/:product_id", ReviewController.getReviewsByProduct);
export default router;
