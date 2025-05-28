import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Category from "../models/category";
import Supplier from "../models/supplier";
import ProductImage from "../models/productImage";
class Product extends Model {
  public product_id!: number;
  public name!: string;
  public description?: string;
  public category_id?: number;
  public supplier_id?: number;
  public price!: number;
  public discount_price?: number;
  public stock_quantity!: number;
  public unit!: string;
  public origin?: string;
  public expiry_date?: Date;
  public image_url?: string;
  public rating?: number;
  public view_count?: number;
  public is_featured?: boolean;
  public is_new?: boolean;
  public is_active?: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Product.init(
  {
    product_id: {
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
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Supplier,
        key: "supplier_id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        check(value: number) {
          if (value < 0) {
            throw new Error("Price cannot be negative");
          }
        },
      },
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        check(value: number) {
          if (value < 0) {
            throw new Error("Stock_quantity cannot be negative");
          }
        },
      },
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING,
    },
    expiry_date: {
      type: DataTypes.DATE,
    },
    image_url: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
   
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    is_new: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

// Liên kết với Category
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});
// Liên kết với ProductImage
// 1 sản phẩm có nhiều hình ảnh
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});
ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
});
// Liên kết với Supplier
Product.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});
Supplier.hasMany(Product, {
  foreignKey: "supplier_id",
  as: "products",
});

export default Product;
