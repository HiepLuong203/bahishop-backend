import express from "express";
import dotenv from "dotenv";
import categoryRoutes from "./routes/category";
import productRoutes from "./routes/product";
import purchaseOrderRoutes from "./routes/purchaseOrder";
import productImageRoutes from "./routes/productImage";
import promotionRoutes from "./routes/promotion";
import productPromotionRoutes from "./routes/productPromotion";
import userRoutes from "./routes/user";
import cartItemRoutes from "./routes/cartItem";
import orderRoutes from "./routes/order";
import supplierRoutes from "./routes/supplier";
import cors from "cors";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

const uploadDir = path.resolve("uploads");
app.use("/uploads", express.static(uploadDir));
//routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchaseorders", purchaseOrderRoutes);
app.use("/api/productimage", productImageRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/productpromotions", productPromotionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cartitems", cartItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/suppliers", supplierRoutes);
// Khởi động server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
