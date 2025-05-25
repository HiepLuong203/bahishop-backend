import { Model, DataTypes } from "sequelize";
import Supplier from "../models/supplier";
import sequelize from "../config/db";
class PurchaseOrder extends Model {
  public id!: number;
  public supplier_id!: number;
  public order_date!: Date;
  public note?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  total_amount!: number;
}

PurchaseOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Supplier,
        key: "supplier_id",
      },
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PurchaseOrder",
    tableName: "purchase_orders",
    timestamps: true,
  }
);
// Liên kết với Supplier
PurchaseOrder.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});
Supplier.hasMany(PurchaseOrder, {
  foreignKey: "supplier_id",
  as: "orders",
});
export default PurchaseOrder;
