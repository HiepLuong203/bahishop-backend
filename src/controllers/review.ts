import { Request, Response } from "express";
import ReviewService from "../services/review";

class ReviewController {
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as any).user.id;
      const { product_id, order_id, rating, comment } = req.body;

      const review = await ReviewService.createReview(user_id,product_id,order_id,rating,comment);

      res.status(201).json({
        message: "Đánh giá đã được tạo thành công.",
        review,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const review_id = Number(req.params.review_id);
      const user_id = (req as any).user.id;
      const { rating, comment } = req.body;

      if (!user_id) {
         res.status(401).json({ message: "Không xác thực người dùng." });return
      }

      const updatedReview = await ReviewService.updateReview(
        review_id,
        user_id,
        rating,
        comment
      );

      res.status(200).json({
        message: "Cập nhật đánh giá thành công.",
        updatedReview,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const review_id = Number(req.params.review_id);
      const user_id = (req as any).user.id;

      if (!user_id) {
         res.status(401).json({ message: "Không xác thực người dùng." });return
      }

      await ReviewService.deleteReview(review_id, user_id);

      res.status(200).json({ message: "Xóa đánh giá thành công." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getReviewsByProduct(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.product_id);
      const reviews = await ReviewService.getReviewsByProduct(product_id);

      res.status(200).json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async countReviewsByProduct(req: Request, res: Response) {
    try {
      const product_id = Number(req.params.product_id);
      const count = await ReviewService.countReviewsByProduct(product_id);
      res.status(200).json({ product_id, review_count: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ReviewController();
