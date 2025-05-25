import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import OrderItem from "../models/orderItem";
import User from "../models/user";
class Order extends Model {
  public order_id!: number;
  public user_id!: number;
  public order_date!: Date;
  public total_amount!: number;
  public shipping_address!: string;
  public shipping_phone!: string;
  public shipping_name!: string;
  public payment_method!: "cod" | "bank_transfer";
  public payment_status!: "pending" | "paid" | "failed";
  public order_status!:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  public notes?: string;
}

Order.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shipping_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shipping_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cod", "bank_transfer"),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    order_status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: false,
  }
);
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
export default Order;
