import { Router } from "express";
import UserController from "../controllers/user";
import authenticateToken from "../middlewares/authentication";

const router = Router();

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.get("/profile", authenticateToken, UserController.me);

router.get("/verifyemail", UserController.verifyEmail);

router.get("/stats-customers", authenticateToken, UserController.getCustomerStats);

router.put("/updateprofile", authenticateToken, UserController.updateProfile);

router.post("/forgetpassword", UserController.forgetPassword);

router.post("/resetpassword", UserController.resetPassword);

router.post("/changepassword", authenticateToken, UserController.changePassword);

export default router;
