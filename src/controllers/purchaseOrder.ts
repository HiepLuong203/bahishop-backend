import { Request, Response } from "express";
import ServicePurchaseOrder from "../services/purchaseOrder";
import { ProductInputForPurchaseOrder } from "../types/purchaseOrder"; // Import interface mới

// Controller cho PurchaseOrder
class PurchaseOrderController {
  // Tạo đơn nhập hàng
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { data, products } = req.body;

      // Ép kiểu 'products' để đảm bảo type-safe với ProductInputForPurchaseOrder[]
      // Đây là nơi bạn mong đợi client sẽ gửi đúng định dạng dữ liệu lô hàng
      const productsWithBatchInfo: ProductInputForPurchaseOrder[] = products;

      const order = await ServicePurchaseOrder.createPurchaseOrder(
        data,
        productsWithBatchInfo // Truyền mảng products đã được ép kiểu
      );
      res.status(201).json(order);
    } catch (err: any) {
      if ( err.validSuppliers) {
        res.status(400).json({
          error: err.message,
          validSuppliers: err.validSuppliers,
        });
        return;
      }
      res.status(500).json({ error: err.message });
      return;
    }
  }

  // Lấy tất cả đơn nhập hàng
  async getAllPurchaseOrders(req: Request, res: Response) {
    try {
      const orders = await ServicePurchaseOrder.getAllPurchaseOrders();
      res.status(200).json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Lấy đơn nhập hàng theo ID
  async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const order = await ServicePurchaseOrder.getPurchaseOrderById(id);
      res.status(200).json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  // Cập nhật đơn nhập hàng
  async updatePurchaseOrder(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { data } = req.body;

    try {
      const updatedOrder = await ServicePurchaseOrder.updatePurchaseOrder(
        id,
        data,
      );
      res.status(200).json({
          message: "Purchase Order updated successfully",
          data: updatedOrder,
        });
    } catch (err: any) {
      if ( err.validSuppliers) {
        res.status(400).json({
          error: err.message,
          validSuppliers: err.validSuppliers,
        });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  }

  // Lấy đơn hàng theo khoảng ngày
  async getPurchaseOrdersByDate(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;          // ?from=YYYY-MM-DD&to=YYYY-MM-DD
      if (!from || !to) {
        res.status(400).json({ message: "Thiếu from hoặc to" });return 
      }

      const fromDate = new Date(from as string);
      const toDate   = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ message: "from/to không phải ngày hợp lệ" });return 
      }

      if (toDate < fromDate) {
        res.status(400).json({ message: "to phải >= from" });return 
      }

      const orders = await ServicePurchaseOrder.getPurchaseOrdersByDateRange(
        fromDate,
        toDate
      );
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default new PurchaseOrderController();