import Order from "../models/order";
import OrderItem from "../models/orderItem";
import { OrderInput, OrderItemInput } from "../types/order";

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
}
