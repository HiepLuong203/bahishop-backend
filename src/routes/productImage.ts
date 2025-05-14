import express from "express";
import multer from "multer";
import ProductImageController from "../controllers/productImage";
import authenticateToken from "../middlewares/authentication";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/:product_id/images",
  upload.array("image_url", 10),
  ProductImageController.createProductImages
);
router.put(
  "/:image_id",
  upload.single("image_url"),
  ProductImageController.updateProductImage
);
router.delete("/:image_id", ProductImageController.deleteProductImage);
export default router;
