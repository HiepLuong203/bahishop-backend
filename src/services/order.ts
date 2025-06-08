import Order from "../models/order";
import OrderItem from "../models/orderItem";
import Product from "../models/product";
import { OrderInput, OrderItemInput,OrderStatus,PaymentStatus } from "../types/order";
import { Op } from "sequelize";
import sequelize from "../config/db";
import ServiceProductBatch from "../services/productBatch"
export default class ServiceOrder {
  static async createOrder(user_id: number, orderData: OrderInput, items: OrderItemInput[]) {
    const transaction = await sequelize.transaction();
    try {
      const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);

      // Đơn hàng luôn bắt đầu với trạng thái 'pending'
      const order = await Order.create({
        user_id,
        total_amount,
        shipping_address: orderData.shipping_address,
        shipping_name: orderData.shipping_name,
        shipping_phone: orderData.shipping_phone,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        notes: orderData.notes,
        order_status: OrderStatus.Pending, // Luôn thiết lập trạng thái ban đầu là Pending
      }, { transaction });

      const qr_code_url = orderData.payment_method === "bank_transfer"
        ? ServiceOrder.generateBankTransferQR(order.order_id, total_amount)
        : null;

      const orderItemsToCreate = items.map((item) => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        fulfilled_quantity: 0, // Số lượng đã thực hiện là 0 khi tạo đơn hàng
        unit_price: item.unit_price,
        discount_price: item.discount_price,
        total_price: item.total_price,
      }));

      await OrderItem.bulkCreate(orderItemsToCreate, { transaction });
      await transaction.commit();

      if (qr_code_url) {
        return {
          order,
          qr_code_url,
        };
      }

      return order;
    } catch (error) {
      await transaction.rollback();
      console.error("Lỗi khi tạo đơn hàng:", error);
      throw error;
    }
  }
  static async getAllOrdersbyAdmin() {
    return Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["product_id", "quantity", "unit_price", "discount_price", "total_price"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [
        ['order_date', 'DESC']
      ],
    });
  }
  static async getAllOrderbyUser(user_id: number) {
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
      order: [
        ['order_date', 'DESC']
      ],
    });

    return orders;
  }

  static async cancelOrderByUser(order_id: number, user_id: number, new_status: string) {
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
  static async cancelOrderByAdmin(order_id: number) {
    const order = await Order.findOne({ where: { order_id } });

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    order.order_status = "cancelled";
    await order.save();

    return { message: "Admin đã hủy đơn hàng thành công." };
  }
  static async updateOrderStatusforAdmin(order_id: number, new_status: string, new_payment_status?: string) {
    const validOrderStatuses = Object.values(OrderStatus);
    const validPaymentStatuses = Object.values(PaymentStatus);

    const transaction = await sequelize.transaction(); 
    try {
      const order = await Order.findOne({
        where: { order_id },
        include: [{ model: OrderItem, as: "orderItems" }], // Sequelize sẽ trả về các thể hiện của OrderItem
        transaction: transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!order) {
        throw new Error(`Order with ID ${order_id} not found`);
      }

      const currentOrderStatus = order.order_status;

      if (!validOrderStatuses.includes(new_status as OrderStatus)) {
        throw new Error(`Invalid order_status value: ${new_status}`);
      }

      if (currentOrderStatus === OrderStatus.Pending && new_status !== OrderStatus.Pending) {
        const orderItems: OrderItem[] = (order as any).orderItems || []; 

        for (const orderItem of orderItems) {
          const quantityToDeductFromBatch = orderItem.quantity; 

          if (quantityToDeductFromBatch > 0) {
            await ServiceProductBatch.deductQuantityFromBatches(
              orderItem.product_id, 
              quantityToDeductFromBatch,
              transaction
            );
          }
        }
      }

      order.order_status = new_status as OrderStatus;

      if (new_payment_status !== undefined) {
        if (validPaymentStatuses.includes(new_payment_status as PaymentStatus)) {
          order.payment_status = new_payment_status as PaymentStatus;
        } else {
          throw new Error(`Invalid payment_status value: ${new_payment_status}`);
        }
      }

      await order.save({ transaction });
      await transaction.commit();

      return {
        message: "Order status updated successfully and stock adjusted.",
        updatedOrder: order,
      };
    } catch (error: any) {
      await transaction.rollback();
      console.error("Error updating order status for admin:", error);
      throw error;
    }
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
 
  static async getOrdersByDateRange(fromDate: Date, toDate: Date) {
    return Order.findAll({
      where: {
        order_date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["order_date", "ASC"]], // sắp xếp theo ngày tăng dần
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
  }
  static async getOrderByIdOrUserId(order_id?: number, user_id?: number) {
    const whereClause: any = {};
    if (order_id) whereClause.order_id = order_id;
    if (user_id) whereClause.user_id = user_id;

    if (Object.keys(whereClause).length === 0) {
      throw new Error("Bạn phải cung cấp ít nhất order_id hoặc user_id.");
    }

    const order = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["product_id", "quantity", "unit_price", "discount_price", "total_price"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    return order;
  }
  static generateBankTransferQR(order_id: number, amount: number) {
  // Đây là ví dụ với QR code theo chuẩn VietQR của các ngân hàng Việt Nam
  const bank_account = "333329082003";
  const bank_name = "MB";
  const account_name = "LUONG BA HIEP";
  const description = `THANHTOAN_ORDER_${order_id}`;
  const qrUrl = `https://img.vietqr.io/image/${bank_name}-${bank_account}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${encodeURIComponent(account_name)}`;
  
  return qrUrl;
}

static async getOrderById(order_id: number) {
  return Order.findOne({
    where: { order_id },
    include: [ 
      {
        model: OrderItem,
        as: "orderItems",
        attributes: ["product_id", "quantity", "unit_price", "discount_price", "total_price"],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name"],
          },
        ],
      },
    ],
  });
}

static async updateOrderPaymentStatus(order_id: number, status: "paid" | "pending") {
  return Order.update(
    { payment_status: status },
    { where: { order_id } }
  );
}

static async addOrderItems(order_id: number, items: OrderItemInput[]) {
  const orderItemsData = items.map(item => ({
    order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_price: item.discount_price,
    total_price: item.total_price,
  }));

  return OrderItem.bulkCreate(orderItemsData);
}

}
