import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class Promotion extends Model {
  public promotion_id!: number;
  public name!: string;
  public description?: string;
  public discount_type!: "percentage" | "fixed_amount";
  public discount_value!: number;
  public start_date!: Date;
  public end_date!: Date;
  public min_order_amount?: number;
  public is_active?: boolean;
  public createdAt!: Date;
  public updatedAt!: Date; // Thêm updatedAt
}

Promotion.init(
  {
    promotion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed_amount"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Promotion",
    tableName: "promotions",
    timestamps: true,
  }
);

export default Promotion;
