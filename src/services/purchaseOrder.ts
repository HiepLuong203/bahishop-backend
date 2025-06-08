import sequelize from "../config/db";
import { Op } from "sequelize";
import PurchaseOrder from "../models/purchaseOrder";
import Product from "../models/product";
import ServiceSupplier from "../services/supplier";
import PurchaseOrderDetail from "../models/purchaseOrderDetail";
import ProductBatch from "../models/productBatch"; // Import ProductBatch model
import { PurchaseOrderAttributes, ProductInputForPurchaseOrder } from "../types/purchaseOrder"; // Import kiểu dữ liệu mới

export default class ServicePurchaseOrder {
  static async createPurchaseOrder(
    data: Partial<PurchaseOrderAttributes>,
    products: ProductInputForPurchaseOrder[] // Sử dụng kiểu dữ liệu mới
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
      const purchaseOrderDetailsToCreate = [];
      const productBatchesToProcess = []; // Mảng để chứa thông tin cần xử lý cho ProductBatch

      // Duyệt qua từng sản phẩm trong mảng 'products'
      for (const product of products) {
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

        // Chuẩn bị dữ liệu cho PurchaseOrderDetail
        purchaseOrderDetailsToCreate.push({
          purchase_order_id: purchaseOrder.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_price: product.unit_price,
          batch_code: product.batch_code, 
          manufacture_date: product.manufacture_date ? new Date(product.manufacture_date) : null, // Chuyển đổi string sang Date
          expiry_date: new Date(product.expiry_date), // Chuyển đổi string sang Date
        });

        // Chuẩn bị dữ liệu để tạo hoặc cập nhật ProductBatch
        productBatchesToProcess.push({
          product_id: product.product_id,
          batch_code: product.batch_code,
          manufacture_date: product.manufacture_date ? new Date(product.manufacture_date) : null,
          expiry_date: new Date(product.expiry_date),
          quantity: product.quantity,
          import_price: product.unit_price,
          import_date: new Date(),
        });
      }

      // Cập nhật lại total_amount cho PurchaseOrder
      await purchaseOrder.update(
        { total_amount: totalAmount },
        { transaction }
      );

      // Tạo tất cả chi tiết đơn hàng cùng lúc
      await PurchaseOrderDetail.bulkCreate(purchaseOrderDetailsToCreate, { transaction });

      // Xử lý tạo/cập nhật ProductBatch
      for (const batchData of productBatchesToProcess) {
        const { product_id, batch_code, manufacture_date, expiry_date, quantity, import_price, import_date } = batchData;

        // Tìm kiếm lô hàng hiện có với cùng product_id, batch_code, và expiry_date
        const existingBatch = await ProductBatch.findOne({
          where: {
            product_id: product_id,
            batch_code: batch_code,
            expiry_date: expiry_date,
          },
          transaction,
        });

        if (existingBatch) {
          // Nếu lô đã tồn tại, cập nhật số lượng
          await existingBatch.update(
            { quantity: existingBatch.quantity + quantity, },
            { transaction }
          );
        } else {
          // Nếu lô không tồn tại, tạo mới
          await ProductBatch.create(
            {
              product_id,
              batch_code,
              manufacture_date,
              expiry_date,
              quantity,
              import_price,
              import_date,
              status: 'available', // Trạng thái mặc định khi nhập
            },
            { transaction }
          );
        }
      }

      // Commit transaction nếu tất cả đều thành công
      await transaction.commit();
      return purchaseOrder;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      if (transaction) await transaction.rollback();
      console.error('Error creating purchase order and updating product batches:', error);
      throw error;
    }
  }

  // Lấy tất cả đơn nhập hàng 
  static async getAllPurchaseOrders(): Promise<PurchaseOrderAttributes[]> {
    const purchaseOrders = await PurchaseOrder.findAll({
      include: [
        {
          model: PurchaseOrderDetail,
          as: "PurchaseOrderDetail", 
        },
      ],
      order: [
        ['created_at', 'DESC']
      ],
    });
    if (!purchaseOrders || purchaseOrders.length === 0) throw new Error("No purchase orders found");
    return purchaseOrders;
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
              as: "product",
              attributes: ["name"],
            },
          ],
        },
      ],
    });
  }

  // Cập nhật đơn nhập hàng 
    static async updatePurchaseOrder(
    id: number,
    data: Partial<PurchaseOrderAttributes> // Chỉ nhận data của PurchaseOrder
  ): Promise<PurchaseOrderAttributes> {
    const transaction = await sequelize.transaction();

    try {
      // Xác thực supplier_id nếu có trong data
      if (data.supplier_id !== undefined) {
        await ServiceSupplier.validateSupplierId(data.supplier_id);
      }
      
      const order = await PurchaseOrder.findByPk(id, { transaction });
      if (!order) {
        throw new Error("PurchaseOrder not found");
      }
      await order.update(data, { transaction });

      await transaction.commit();
      return order;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  // Lấy đơn hàng theo khoảng ngày 
  static async getPurchaseOrdersByDateRange(fromDate: Date,toDate: Date): Promise<PurchaseOrderAttributes[]> {
    return PurchaseOrder.findAll({
      where: {
        order_date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["order_date", "ASC"]],
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