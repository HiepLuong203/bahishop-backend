import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import PurchaseOrder from "../models/purchaseOrder";
import Product from "../models/product";

class PurchaseOrderDetail extends Model {
  public id!: number;
  public purchase_order_id!: number;
  public product_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public batch_code!: string;       // Đổi lại thành batch_code
  public manufacture_date?: Date;
  public expiry_date!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

PurchaseOrderDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    purchase_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    batch_code: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    manufacture_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATEONLY, // Hạn sử dụng bắt buộc khi nhập hàng
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "PurchaseOrderDetail",
    tableName: "purchase_order_details",
    timestamps: true,
  }
);

// Liên kết với PurchaseOrder
PurchaseOrderDetail.belongsTo(PurchaseOrder, {
  foreignKey: "purchase_order_id",
  as: "purchaseOrder",
});

// Liên kết với Product
PurchaseOrderDetail.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
PurchaseOrder.hasMany(PurchaseOrderDetail, {
  foreignKey: "purchase_order_id",
  as: "PurchaseOrderDetail",
});
export default PurchaseOrderDetail;
