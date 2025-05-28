import sequelize from "../config/db";
import { Op } from "sequelize";
import PurchaseOrder from "../models/purchaseOrder";
import Product from "../models/product";
import ServiceSupplier from "../services/supplier";
import PurchaseOrderDetail from "../models/purchaseOrderDetail";
import { PurchaseOrderAttributes } from "../types/purchaseOrder";
export default class ServicePurchaseOrder {
  static async createPurchaseOrder(
    data: Partial<PurchaseOrderAttributes>,
    products: { product_id: number; quantity: number; unit_price: number }[]
  ) {
    const transaction = await sequelize.transaction();

    try {
      await ServiceSupplier.validateSupplierId(data.supplier_id ?? null);
      // Tạo đơn hàng mới với total_amount mặc định là 0
      const purchaseOrder = await PurchaseOrder.create(
        {
          ...data,
          total_amount: 0,
        },
        { transaction }
      );

      let totalAmount = 0;

      // Tính toán tổng số tiền từ các chi tiết đơn hàng
      for (let product of products) {
        const foundProduct = await Product.findByPk(product.product_id, {
          transaction,
        });
        if (!foundProduct) {
          throw new Error(
            `Product with ID ${product.product_id} does not exist.`
          );
        }
        const amount = product.quantity * product.unit_price;
        totalAmount += amount;

        // Tạo chi tiết đơn hàng
        await PurchaseOrderDetail.create(
          {
            purchase_order_id: purchaseOrder.id,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price,
          },
          { transaction }
        );

        // Cập nhật tồn kho của sản phẩm
        const updatedStockQuantity =
          foundProduct.stock_quantity + product.quantity;
        await foundProduct.update(
          { stock_quantity: updatedStockQuantity },
          { transaction }
        );
      }

      // Cập nhật lại total_amount sau khi tính toán
      await purchaseOrder.update(
        { total_amount: totalAmount },
        { transaction }
      );

      // Commit transaction nếu tất cả đều thành công
      await transaction.commit();
      return purchaseOrder;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw error;
    }
  }

  // Lấy tất cả đơn nhập hàng
  static async getAllPurchaseOrders(): Promise<PurchaseOrderAttributes[]> {
    const purchaseOrder = await PurchaseOrder.findAll({
      include: [{ model: PurchaseOrderDetail, as: "PurchaseOrderDetail" }],
    });
    if (!purchaseOrder) throw new Error("No purchase orders found");
    return purchaseOrder;
  }

  // Lấy chi tiết đơn nhập hàng theo ID
  static async getPurchaseOrderById(id: number): Promise<PurchaseOrderAttributes | null> {
    return PurchaseOrder.findByPk(id, {
      include: [
        {
          model: PurchaseOrderDetail,
          as: "PurchaseOrderDetail",
          include: [
            {
              model: Product,
              as: "product", // tên alias bạn đặt trong association
              attributes: ["name"], // lấy các trường cụ thể, ví dụ name
            },
          ],
        },
      ],
    });
  }

  // Cập nhật đơn nhập hàng
  static async updatePurchaseOrder(
    id: number,
    data: Partial<PurchaseOrderAttributes>,
    products?: {
      id: number;
      product_id: number;
      quantity: number;
      unit_price: number;
    }[]
  ): Promise<PurchaseOrderAttributes> {
    const transaction = await sequelize.transaction();

    try {
      await ServiceSupplier.validateSupplierId(data.supplier_id ?? null);
      // Lấy đơn hàng
      const order = await PurchaseOrder.findByPk(id, { transaction });
      if (!order) {
        throw new Error("PurchaseOrder not found");
      }

      // Cập nhật đơn hàng
      await order.update(data, { transaction });
      let totalAmount = 0;
      if (products && products.length > 0) {
        for (let detail of products) {
          // Tìm PurchaseOrderDetail qua ID của chi tiết đơn hàng (detail.id)
          const existingDetail = await PurchaseOrderDetail.findByPk(detail.id, {
            transaction,
          });
          if (!existingDetail) {
            throw new Error(
              `PurchaseOrderDetail with ID ${detail.id} not found`
            );
          }

          // Tìm sản phẩm
          const product = await Product.findByPk(detail.product_id, {
            transaction,
          });
          if (!product) {
            throw new Error(`Product with ID ${detail.product_id} not found`);
          }

          // Tính toán sự thay đổi số lượng và cập nhật tồn kho
          const quantityDifference = detail.quantity - existingDetail.quantity;
          const updatedStockQuantity =
            product.stock_quantity + quantityDifference;

          // Cập nhật tồn kho
          await product.update(
            { stock_quantity: updatedStockQuantity },
            { transaction }
          );

          // Cập nhật chi tiết đơn hàng
          await existingDetail.update(
            {
              quantity: detail.quantity,
              unit_price: detail.unit_price,
            },
            { transaction }
          );
          totalAmount += detail.quantity * detail.unit_price;
        }
      }
      await order.update({ total_amount: totalAmount }, { transaction });
      // Commit transaction nếu tất cả đều thành công
      await transaction.commit();

      return order;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw error;
    }
  }
  static async getPurchaseOrdersByDateRange(fromDate: Date,toDate: Date): Promise<PurchaseOrderAttributes[]> {
    return PurchaseOrder.findAll({
      where: {
        order_date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["order_date", "ASC"]], //sắp xếp theo ngày tăng dần
      include: [
        {
          model: PurchaseOrderDetail,
          as: "PurchaseOrderDetail",
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
}
