import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class Supplier extends Model {
  public supplier_id!: number;
  public name!: string;
  public address?: string;
  public phone?: string;
  public email?: string;
  public contact_person?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Supplier.init(
  {
    supplier_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[0-9\-+()\s]*$/i
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Email is not valid",
        },
      },
    },
    contact_person: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "Supplier",
    tableName: "suppliers",
    timestamps: true,
  }
);

export default Supplier;
