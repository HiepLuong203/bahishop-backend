import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Product from "./product";

class ProductBatch extends Model {
  public batch_id!: number;
  public product_id!: number;
  public batch_code!: string; 
  public manufacture_date?: Date;
  public expiry_date!: Date;
  public quantity!: number;
  public import_price!: number;
  public import_date!: Date;
  public status!: 'available' | 'expired' | 'quarantined' | 'sold_out'; 
  public createdAt!: Date;
  public updatedAt!: Date;
}

ProductBatch.init(
  {
    batch_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "product_id",
      },
    },
    batch_code: { 
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: false,
    },
    manufacture_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    import_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    import_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'available',
      validate: {
        isIn: [['available', 'expired', 'quarantined', 'sold_out']],
      },
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
    modelName: "ProductBatch",
    tableName: "product_batches",
    timestamps: true,
  }
);

ProductBatch.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(ProductBatch, {
  foreignKey: "product_id",
  as: "batches",
});

export default ProductBatch;