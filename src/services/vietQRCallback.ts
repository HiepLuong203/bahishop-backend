// src/services/vietQRCallback.ts
import ServiceOrder from "./order";
import WebhookService from "./webhook";

class VietQRCallbackService {
  async processVietQRCallback(callbackData: any) {
    console.log("VietQRCallbackService: Đã nhận dữ liệu callback:", callbackData);
    console.log("VietQRCallbackService: Đang xác thực dữ liệu (nếu có).");
    if (callbackData.status !== "SUCCESS") { 
      throw new Error("Giao dịch chưa thành công hoặc có lỗi.");
    }

    const description = callbackData.description; 
    if (!description) {
      throw new Error("Không tìm thấy nội dung chuyển khoản (description).");
    }

    const orderIdMatch = description.match(/THANHTOAN_ORDER_(\d+)/);
    if (!orderIdMatch || !orderIdMatch[1]) {
      throw new Error("Không thể trích xuất Order ID từ nội dung chuyển khoản.");
    }
    const order_id = parseInt(orderIdMatch[1], 10);
    console.log(`VietQRCallbackService: Đã trích xuất Order ID: ${order_id}`);

    const order = await ServiceOrder.getOrderById(order_id);
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng với ID: ${order_id}`);
    }
    const user_id = order.user_id; // Lấy user_id từ đối tượng đơn hàng
    console.log(`VietQRCallbackService: Đã tìm thấy User ID: ${user_id} cho Order ID: ${order_id}`);

    const transferredAmount = parseFloat(callbackData.amount);
    const expectedAmount = parseFloat(order.total_amount.toString()); 

    if (isNaN(transferredAmount) || transferredAmount < expectedAmount) { // Hoặc == expectedAmount
        throw new Error(`Số tiền chuyển khoản (${transferredAmount}) không khớp với đơn hàng (${expectedAmount}).`);
    }
    console.log("VietQRCallbackService: Số tiền đã được xác minh.");

    const internalWebhookPayload = {
      user_id: user_id,
      payment_method: "bank_transfer",
      is_paid: true, 
      order_info: {
        order_id: order_id,
      },
    };

    console.log("VietQRCallbackService: Đang gọi WebhookService.handleBankTransferWebhook...");
    const result = await WebhookService.handleBankTransferWebhook(internalWebhookPayload);

    console.log("VietQRCallbackService: Xử lý callback thành công.");
    return {
      success: true,
      message: "Callback VietQR đã được xử lý thành công.",
      orderResult: result,
    };

  }

}

export default new VietQRCallbackService();