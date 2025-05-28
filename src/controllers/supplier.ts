import { Request, Response } from "express";
import ServiceSupplier from "../services/supplier";

class SupplierController {
  // Tạo nhà cung cấp
  async create(req: Request, res: Response) {
    try {
      const supplier = await ServiceSupplier.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy tất cả nhà cung cấp
  async getAll(req: Request, res: Response) {
    try {
      const suppliers = await ServiceSupplier.getAllSuppliers();
      res.json(suppliers);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy nhà cung cấp theo ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await ServiceSupplier.getSupplierById(Number(id));
      res.json(supplier);
    } catch (error:any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Cập nhật nhà cung cấp
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await ServiceSupplier.updateSupplier(Number(id), req.body);
      res.json(supplier);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Xóa nhà cung cấp
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ServiceSupplier.deleteSupplier(Number(id));
      res.json(result);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }
  async getSuplierbyName(req: Request, res: Response) {
    try {
      const name = req.query.name as string;
      const suppliers = await ServiceSupplier.getSupplierByName(name);
      res.json(suppliers);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SupplierController();
