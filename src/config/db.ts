import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize({
  dialect: "mysql" as const,
  host: (process.env.DB_HOST as string) || "localhost",
  username: (process.env.DB_USER as string) || "root",
  password: (process.env.DB_PASSWORD as string) || "root",
  database: (process.env.DB_NAME as string) || "datn",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected MySQL");
  })
  .catch((err: Error) => {
    console.log("Error connect MySQL", err);
    throw err;
  });

export default sequelize;
