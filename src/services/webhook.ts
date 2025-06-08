// services/webhook.ts
import CartItemService from "../services/cartItem";
import ServiceOrder from "../services/order";

class WebhookService {
  async handleBankTransferWebhook(data: any) {
    const { user_id, payment_method, is_paid, order_info } = data;

    if (payment_method !== "bank_transfer") {
      throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    if (!is_paid) {
      throw new Error("Khách hàng chưa thanh toán.");
    }

    const existingOrder = await ServiceOrder.getOrderById(order_info.order_id);

    if (!existingOrder) {
      throw new Error("Không tìm thấy đơn hàng để cập nhật.");
    }

    if (existingOrder.payment_status === "paid") {
      throw new Error("Đơn hàng đã được thanh toán trước đó.");
    }

    const productIdsInOrder = existingOrder.orderItems?.map((item: any) => item.product_id) || [];

    if (productIdsInOrder.length === 0) {
        throw new Error("Đơn hàng không có sản phẩm nào để xử lý.");
    }
    await ServiceOrder.updateOrderPaymentStatus(order_info.order_id, "paid");

    for (const productId of productIdsInOrder) {
      await CartItemService.removeCartItem(user_id, productId);
    }

    return {
      message: "Thanh toán thành công. Đơn hàng đã được cập nhật.",
      order_id: order_info.order_id,
    };
  }
}

export default new WebhookService();