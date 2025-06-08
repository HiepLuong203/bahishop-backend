import express from "express";
import WebhookController from "../controllers/webhook";
import VietQRCallbackController from "../controllers/vietQRCallback";
const router = express.Router();

router.post("/payment", WebhookController.handlePaymentWebhook);
router.post("/payment-callback", VietQRCallbackController.handleVietQRCallback);
export default router;
