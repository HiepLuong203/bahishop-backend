import Review from "../models/review";
import Order from "../models/order";
import Product from "../models/product";
import User from "../models/user";

export default class ReviewService {
  static async createReview(
    user_id: number,
    product_id: number,
    order_id: number,
    rating: number,
    comment?: string
  ) {
    // Kiểm tra người dùng tồn tại
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("Người dùng không tồn tại.");

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error("Sản phẩm không tồn tại.");

    // Kiểm tra đơn hàng có đúng user không và đã giao chưa
    const order = await Order.findOne({
      where: {
        order_id: order_id,
        user_id: user_id,
        order_status: "delivered", // chỉ đơn đã giao mới được đánh giá
      },
    });

    if (!order) {
      throw new Error("Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao.");
    }

    // Kiểm tra đã từng đánh giá sản phẩm trong đơn hàng này chưa
    const existingReview = await Review.findOne({
      where: {
        user_id,
        product_id,
        order_id,
      },
    });

    if (existingReview) {
      throw new Error("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.");
    }

    // Tạo đánh giá mới
    const review = await Review.create({
      user_id,
      product_id,
      order_id,
      rating,
      comment,
    });

    return review;
  }

  static async getReviewsByProduct(product_id: number) {
    return await Review.findAll({
      where: { product_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name"],
        },
      ],
      order: [["review_date", "DESC"]],
    });
  }
  static async updateReview(
     review_id: number,
     user_id: number,
     rating?: number,
     comment?: string
     ) {
     const review = await Review.findByPk(review_id);
     if (!review) {
     throw new Error("Đánh giá không tồn tại.");
     }

     if (review.user_id !== user_id) {
     throw new Error("Bạn không có quyền sửa đánh giá này.");
     }

     if (rating !== undefined) {
     if (rating < 1 || rating > 5) {
          throw new Error("Rating phải nằm trong khoảng từ 1 đến 5.");
     }
     review.rating = rating;
     }

     if (comment !== undefined) {
     review.comment = comment;
     }

     await review.save();

     return {
     message: "Cập nhật đánh giá thành công.",
     review,
     };
     }

  static async deleteReview(review_id: number, user_id: number) {
    const review = await Review.findByPk(review_id);
    if (!review) throw new Error("Đánh giá không tồn tại.");
    if (review.user_id !== user_id)
      throw new Error("Bạn không có quyền xóa đánh giá này.");

    await review.destroy();
    return { message: "Xóa đánh giá thành công." };
  }
  static async countReviewsByProduct(product_id: number): Promise<number> {
    const count = await Review.count({
      where: { product_id },
    });
    return count;
  }
}
