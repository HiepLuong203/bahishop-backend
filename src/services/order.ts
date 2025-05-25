import Order from "../models/order";
import OrderItem from "../models/orderItem";
import Product from "../models/product";
import { OrderInput, OrderItemInput } from "../types/order";
import { Op } from "sequelize";
export default class ServiceOrder {
  static async createOrder(
    user_id: number,
    orderData: OrderInput,
    items: OrderItemInput[]
  ) {
    const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);

    const order = await Order.create({
      user_id,
      total_amount,
      shipping_address: orderData.shipping_address,
      shipping_name: orderData.shipping_name,
      shipping_phone: orderData.shipping_phone,
      payment_method: orderData.payment_method,
      payment_status: "pending",
      notes: orderData.notes,
    });

    const orderItemsData = items.map((item) => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_price: item.discount_price,
      total_price: item.total_price,
    }));

    await OrderItem.bulkCreate(orderItemsData);

    return order;
  }
  static async getAllOrder(user_id: number) {
  const orders = await Order.findAll({
    where: { user_id: user_id },
    include: [
      {
        model: OrderItem,
        as: "orderItems",
        attributes: ["product_id", "quantity", "unit_price", "discount_price", "total_price"],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name"], // Lấy tên sản phẩm từ bảng Product
          },
        ],
      },
    ],
  });

  return orders;
}

  static async updateOrderStatus(order_id: number, user_id: number, new_status: string) {
    // Tìm đơn hàng dựa trên ID và user_id
    const order = await Order.findOne({ where: { order_id, user_id } });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    // Kiểm tra trạng thái hiện tại
    if (order.order_status !== "pending") {
      throw new Error("Đơn hàng đã được tiếp nhận, không thể hủy.");
    }

    // Nếu trạng thái mới là "cancelled", cho phép hủy
    if (new_status === "cancelled") {
      order.order_status = "cancelled";
      await order.save();
      return { message: "Đơn hàng đã được hủy thành công." };
    }

    throw new Error("Không thể thay đổi trạng thái đơn hàng.");
  }
  static async countAllOrders() {
    const [total, order_completed, order_incompleted, order_cancel] = await Promise.all([
      // Đếm tổng đơn hàng
      Order.count({
        distinct: true,
        col: 'order_id',
      }),
      // Đếm đơn đã hoàn thành (delivered)
      Order.count({
        where: {
          order_status: 'delivered',
        },
        distinct: true,
        col: 'order_id',
      }),
      // Đếm đơn chưa hoàn thành (không phải delivered và cancelled)
      Order.count({
        where: {
          order_status: {
            [Op.notIn]: ['delivered', 'cancelled'],
          },
        },
        distinct: true,
        col: 'order_id',
      }),
      // Đếm đơn bị hủy (cancelled)
      Order.count({
        where: {
          order_status: 'cancelled',
        },
        distinct: true,
        col: 'order_id',
      }),
    ]);

    return { total, order_completed, order_incompleted, order_cancel };
  }

}
