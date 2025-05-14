import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "../models/product";
class CartItem extends Model {
  public cart_item_id!: number;
  public user_id!: number;
  public product_id!: number;
  public quantity!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public product?: Product;
}

CartItem.init(
  {
    cart_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
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
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "added_at",
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
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: false,
  }
);
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
export default CartItem;
