// src/services/productBatch.ts

import ProductBatch from "../models/productBatch";
import Product from "../models/product";
import { ProductBatchAttributes, ProductBatchStatus,ProductBatchStatusEnum } from "../types/productBatch";
import { Op,Transaction } from "sequelize";

export default class ServiceProductBatch {
     //Lấy tất cả lô sản phẩm
  static async getBatches(
    status?: ProductBatchStatus,
    productId?: number
  ): Promise<ProductBatchAttributes[]> {
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (productId) {
      whereClause.product_id = productId;
    }

    const batches = await ProductBatch.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'unit'],
        },
      ],
      order: [['expiry_date', 'ASC']],
    });
    return batches as unknown as ProductBatchAttributes[];
  }
//lấy lô sản phẩm theo batch_id
  static async getBatchById(id: number): Promise<ProductBatchAttributes | null> {
    const batch = await ProductBatch.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'unit'],
        },
      ],
    });
    return batch as unknown as ProductBatchAttributes | null;
  }
// cập nhật trạng thái lô sản phẩm
  static async updateBatchStatus(
    id: number,
    newStatus: ProductBatchStatus
  ): Promise<ProductBatchAttributes> {
    const batch = await ProductBatch.findByPk(id);
    if (!batch) {
      throw new Error(`Product Batch with ID ${id} not found.`);
    }

    // Các quy tắc nghiệp vụ khi thay đổi trạng thái:
    if (newStatus === 'sold_out' && batch.quantity > 0) {
      throw new Error("Cannot manually set 'sold_out' status if batch quantity is greater than 0. Use sales transactions or adjustments to deplete quantity.");
    }
    if (batch.status === 'expired' && newStatus === 'available') {
      throw new Error("Cannot change status from 'expired' to 'available'.");
    }

    await batch.update({ status: newStatus });
    return batch as unknown as ProductBatchAttributes;
  }
//cập nhật số lượng sản phẩm trong lô sản phẩm (do hỏng,...)
  static async adjustBatchQuantity(
    id: number,
    quantityChange: number,
    reason?: string
  ): Promise<ProductBatchAttributes> {
    const batch = await ProductBatch.findByPk(id);
    if (!batch) {
      throw new Error(`Product Batch with ID ${id} not found.`);
    }

    const newQuantity = batch.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(`Cannot adjust batch quantity to ${newQuantity}. Insufficient stock in batch.`);
    }

    let updatedStatus = batch.status;
    if (newQuantity === 0 && batch.status !== 'sold_out' && batch.status !== 'expired' && batch.status !== 'quarantined') {
      updatedStatus = 'sold_out';
    } else if (newQuantity > 0 && batch.status === 'sold_out') {
        updatedStatus = 'available';
    }

    await batch.update({ quantity: newQuantity, status: updatedStatus });
    return batch as unknown as ProductBatchAttributes;
  }
// lọc sản phẩm sắp hết hạn
  static async getExpiringBatches(
    daysToExpiry: number,
    includeExpired: boolean = false
  ): Promise<ProductBatchAttributes[]> {
    const today = new Date();
    const expiryDateThreshold = new Date();
    expiryDateThreshold.setDate(today.getDate() + daysToExpiry);
    const formattedExpiryDateThreshold = expiryDateThreshold.toISOString().split('T')[0];

    const whereClause: any = {
      expiry_date: {
        [Op.lte]: formattedExpiryDateThreshold,
      },
      quantity: {
        [Op.gt]: 0,
      },
         status: includeExpired ? { [Op.in]: ['available', 'expired'] } : 'available',
    };

    const batches = await ProductBatch.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'unit'],
        },
      ],
      order: [['expiry_date', 'ASC']],
    });
    return batches as unknown as ProductBatchAttributes[];
  }
//tự động cập nhật sản phẩm hết hạn
  static async updateExpiredBatches(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [updatedRows] = await ProductBatch.update(
      { status: 'expired' },
      {
        where: {
          expiry_date: {
            [Op.lt]: today,
          },
          status: 'available',
          quantity: {
            [Op.gt]: 0,
          }
        },
      }
    );
  }
//cap nhat so luong khi mua hang
  static async deductQuantityFromBatches(
        productId: number,
        quantityToDeduct: number,
        transaction: Transaction
    ): Promise<void> { 
        if (quantityToDeduct <= 0) {
            return; 
        }

        const availableBatches = await ProductBatch.findAll({
            where: {
                product_id: productId,
                quantity: { [Op.gt]: 0 },
                status: ProductBatchStatusEnum.Available, // Chỉ giảm từ các lô 'available'
                expiry_date: { [Op.gt]: new Date() } // Đảm bảo lô hàng chưa hết hạn
            },
            order: [
                ['expiry_date', 'ASC'], // FEFO: ưu tiên các lô hết hạn sớm hơn
                ['import_date', 'ASC'], // FIFO tie-breaker: ưu tiên các lô nhập sớm hơn
            ],
            transaction: transaction,
            lock: transaction.LOCK.UPDATE
        });

        const totalAvailableQuantity = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);
        if (totalAvailableQuantity < quantityToDeduct) {
            throw new Error(`Không đủ hàng tồn kho cho sản phẩm ID ${productId}. Cần ${quantityToDeduct}, nhưng chỉ có ${totalAvailableQuantity} khả dụng.`);
        }

        let remainingQuantityToDeduct = quantityToDeduct;
        const batchesToUpdate: ProductBatch[] = [];

        for (const batch of availableBatches) {
            if (remainingQuantityToDeduct <= 0) {
                break; // Đã đủ số lượng
            }

            const quantityInCurrentBatch = batch.quantity;

            if (quantityInCurrentBatch >= remainingQuantityToDeduct) {
                // Lô hiện tại có thể đáp ứng đủ số lượng còn lại
                batch.quantity -= remainingQuantityToDeduct;
                remainingQuantityToDeduct = 0;
            } else {
                // Lô hiện tại không đủ, sử dụng toàn bộ số lượng của nó
                remainingQuantityToDeduct -= quantityInCurrentBatch;
                batch.quantity = 0;
                if (batch.status === ProductBatchStatusEnum.Available) {
                    batch.status = ProductBatchStatusEnum.SoldOut;
                }
            }
            batchesToUpdate.push(batch);
        }

        for (const batch of batchesToUpdate) {
            await batch.save({ transaction: transaction });
        }
        if (remainingQuantityToDeduct > 0) {
            throw new Error("Lỗi nội bộ: Không thể trừ đủ số lượng mặc dù kiểm tra ban đầu cho thấy đủ hàng.");
        }
    }
}