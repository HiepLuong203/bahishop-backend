import { Router } from "express";
import ProductController from "../controllers/product";
import uploadImages from "../middlewares/uploadImages";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post(
  "/",
  uploadImages.single("image_url"),
  ProductController.createProduct
);
router.get("/", ProductController.getAllProducts);
router.get("/status",authenticateToken, ProductController.getProductsByStatus);
router.get('/count-all-products',authenticateToken, ProductController.countAll);
router.get("/category/:category_id", ProductController.getProductsByCategory);
router.get("/search", ProductController.searchProducts);
router.get("/filter/price", ProductController.filterByPrice);
router.get("/:product_id", ProductController.getProductById);
router.put(
  "/:product_id",
  authenticateToken,
  uploadImages.single("image_url"),
  ProductController.updateProduct
);
router.delete("/:product_id",authenticateToken, ProductController.deleteProduct);
export default router;
