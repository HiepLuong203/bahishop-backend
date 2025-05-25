import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Order from "../models/order";
import Product from "../models/product";

class OrderItem extends Model {
  public order_item_id!: number;
  public order_id!: number;
  public product_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public discount_price?: number;
  public total_price!: number;
}

OrderItem.init(
  {
    order_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: false,
  }
);

// OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default OrderItem;
