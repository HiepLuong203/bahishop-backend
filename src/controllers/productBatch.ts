// src/controllers/productBatch.ts

import { Request, Response } from "express";
import ServiceProductBatch from "../services/productBatch";
import { ProductBatchStatus, UpdateBatchStatusPayload, AdjustBatchQuantityPayload } from "../types/productBatch";

class ProductBatchController {
  async getBatches(req: Request, res: Response): Promise<void> {
    try {
      const { status, productId } = req.query;
      const batches = await ServiceProductBatch.getBatches(
        status as ProductBatchStatus,
        productId ? Number(productId) : undefined
      );
      res.status(200).json(batches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBatchById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const batch = await ServiceProductBatch.getBatchById(id);
      if (!batch) {
        res.status(404).json({ message: `Product Batch with ID ${id} not found.` });
        return;
      }
      res.status(200).json(batch);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateBatchStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { newStatus }: UpdateBatchStatusPayload = req.body;

      // Kiểm tra giá trị newStatus có hợp lệ không
      const validStatuses: ProductBatchStatus[] = ['available', 'expired', 'quarantined', 'sold_out'];
      if (!validStatuses.includes(newStatus)) {
        res.status(400).json({ message: "Invalid status provided." });
        return;
      }

      const updatedBatch = await ServiceProductBatch.updateBatchStatus(id, newStatus);
      res.status(200).json({
        message: "Product Batch status updated successfully.",
        data: updatedBatch,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message }); // 400 cho lỗi nghiệp vụ
    }
  }

  async adjustBatchQuantity(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { quantityChange, reason }: AdjustBatchQuantityPayload = req.body;

      if (typeof quantityChange !== 'number' || isNaN(quantityChange) || quantityChange === 0) {
        res.status(400).json({ message: "Invalid quantityChange provided. Must be a non-zero number." });
        return;
      }

      const updatedBatch = await ServiceProductBatch.adjustBatchQuantity(id, quantityChange, reason);
      res.status(200).json({
        message: "Product Batch quantity adjusted successfully.",
        data: updatedBatch,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getExpiringBatches(req: Request, res: Response): Promise<void> {
    try {
      const daysToExpiry = req.query.days ? Number(req.query.days) : 30; // Mặc định 30 ngày
      const includeExpired = req.query.includeExpired === 'true';

      if (isNaN(daysToExpiry) || daysToExpiry < 0) {
        res.status(400).json({ message: "Invalid days parameter. Must be a non-negative number." });
        return;
      }

      const batches = await ServiceProductBatch.getExpiringBatches(daysToExpiry, includeExpired);
      res.status(200).json(batches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateExpiredBatches(req: Request, res: Response): Promise<void> {
    try {
      await ServiceProductBatch.updateExpiredBatches();
      res.status(200).json({ message: "Expired batches updated successfully." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ProductBatchController();