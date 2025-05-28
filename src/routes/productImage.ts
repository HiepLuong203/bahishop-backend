import express from "express";
import upload from "../middlewares/uploadImages";
import ProductImageController from "../controllers/productImage";
import authenticateToken from "../middlewares/authentication";

const router = express.Router();
router.get("/product/:product_id/images", ProductImageController.getProductImagesByProduct);
router.post(
  "/:product_id/images",
  authenticateToken,
  upload.array("image_url", 10),
  ProductImageController.createProductImages
);
router.put(
  "/:image_id",
  authenticateToken,
  upload.single("image_url"),
  ProductImageController.updateProductImage
);
router.delete("/:image_id",authenticateToken, ProductImageController.deleteProductImage);
export default router;
