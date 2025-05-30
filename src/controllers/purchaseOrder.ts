import { Request, Response } from "express";
import ServicePurchaseOrder from "../services/purchaseOrder";

// Controller cho PurchaseOrder
class PurchaseOrderController {
  // Tạo đơn nhập hàng
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { data, products } = req.body;
      const order = await ServicePurchaseOrder.createPurchaseOrder(
        data,
        products
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
    const { data, products } = req.body;

    try {
      // Gọi service để thực hiện cập nhật
      const updatedOrder = await ServicePurchaseOrder.updatePurchaseOrder(
        id,
        data,
        products
      );
      // Trả về kết quả
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
  async getPurchaseOrdersByDate(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;          // ?from=YYYY-MM-DD&to=YYYY-MM-DD
      if (!from || !to) {
        res.status(400).json({ message: "Thiếu from hoặc to" });return 
      }

      const fromDate = new Date(from as string);
      const toDate   = new Date(to as string);

      // kiểm tra date hợp lệ
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ message: "from/to không phải ngày hợp lệ" });return 
      }

      // đảm bảo toDate >= fromDate
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
