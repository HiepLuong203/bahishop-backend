import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Product from "./product";
import User from "./user";
import Order from "./order";

class Review extends Model {
  public review_id!: number;
  public product_id!: number;
  public user_id!: number;
  public order_id!: number;
  public rating!: number;
  public comment?: string;
  public review_date!: Date;
}

Review.init(
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: false,
  }
);

// Mối quan hệ với Product
Review.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(Review, {
  foreignKey: "product_id",
  as: "reviews",
});

// Mối quan hệ với User
Review.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
User.hasMany(Review, {
  foreignKey: "user_id",
  as: "reviews",
});

// Mối quan hệ với Order
Review.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});
Order.hasMany(Review, {
  foreignKey: "order_id",
  as: "reviews",
});

export default Review;
