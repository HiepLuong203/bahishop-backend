import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Product from "../models/product";
import Promotion from "../models/promotion";

class ProductPromotion extends Model {
  public product_promotion_id!: number;
  public product_id!: number;
  public promotion_id!: number;
}

ProductPromotion.init(
  {
    product_promotion_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promotion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductPromotion",
    tableName: "product_promotions",
    timestamps: false,
  }
);

// Setup liên kết
ProductPromotion.belongsTo(Product, { foreignKey: "product_id" });
ProductPromotion.belongsTo(Promotion, { foreignKey: "promotion_id" });

export default ProductPromotion;
