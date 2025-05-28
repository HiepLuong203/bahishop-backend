import { Router } from "express";
import SupplierController from "../controllers/supplier";
import authenticateToken from "../middlewares/authentication";
const router = Router();

router.post("/",authenticateToken, SupplierController.create);     
router.get("/", SupplierController.getAll);   
router.get("/search",authenticateToken, SupplierController.getSuplierbyName);     
router.get("/:id", SupplierController.getById);   
router.put("/:id",authenticateToken, SupplierController.update);   
router.delete("/:id",authenticateToken, SupplierController.delete);

export default router;
