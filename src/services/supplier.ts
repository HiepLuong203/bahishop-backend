import Supplier from "../models/supplier";
import { Op } from "sequelize";
import { SupplierAttributes } from "../types/supplier";
export default class ServiceSupplier {
  // Tạo nhà cung cấp mới
  static async createSupplier(data: Partial<SupplierAttributes>) {
    try {
      const supplier = await Supplier.create(data);
      return supplier;
    } catch (error) {
      throw new Error("Lỗi khi tạo nhà cung cấp: " + error);
    }
  }

  // Lấy tất cả nhà cung cấp
  static async getAllSuppliers() {
    try {
      const suppliers = await Supplier.findAll();
      return suppliers;
    } catch (error) {
      throw new Error("Lỗi khi lấy danh sách nhà cung cấp: " + error);
    }
  }

  // Lấy nhà cung cấp theo ID
  static async getSupplierById(id: number) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) throw new Error("Nhà cung cấp không tồn tại");
      return supplier;
    } catch (error) {
      throw new Error("Lỗi khi lấy nhà cung cấp: " + error);
    }
  }

  // Cập nhật nhà cung cấp
  static async updateSupplier(id: number, data: Partial<SupplierAttributes>) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) throw new Error("Nhà cung cấp không tồn tại");
      await supplier.update(data);
      return supplier;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật nhà cung cấp: " + error);
    }
  }

  // Xóa nhà cung cấp
  static async deleteSupplier(id: number) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) throw new Error("Nhà cung cấp không tồn tại");
      await supplier.destroy();
      return { message: "Xóa thành công" };
    } catch (error) {
      throw new Error("Lỗi khi xóa nhà cung cấp: " + error);
    }
  }
     // Kiểm tra tính hợp lệ của supplier_id
  static async validateSupplierId(supplier_id: number | null) {
     if (!supplier_id) return;
 
     const supplier = await Supplier.findByPk(supplier_id);
     if (!supplier) {
       const validSuppliers = await Supplier.findAll({ attributes: ["supplier_id", "name"] });
       const error: any = new Error("supplier_id không hợp lệ");
       error.validSuppliers = validSuppliers;
       throw error;
     }
  }
  static async getSupplierByName(name: string) {
    try {
      const supplier = await Supplier.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
        },
      });
      return supplier;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm nhà cung cấp: " + error);
    }
  }
}

