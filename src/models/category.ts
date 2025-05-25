import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class Category extends Model {
  public category_id!: number;
  public name!: string;
  public description?: string;
  public parent_id?: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}
Category.init(
  {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    parent_id: {
      type: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true,
  }
);

// Quan hệ cha-con với category (subcategories)
Category.belongsTo(Category, {
  foreignKey: "parent_id",
  as: "parentCategory",
  onDelete: "CASCADE",
});

Category.hasMany(Category, {
  foreignKey: "parent_id",
  as: "subcategories",
  onDelete: "CASCADE",
  hooks: true,
});

export default Category;
