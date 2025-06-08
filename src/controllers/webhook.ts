import { Request, Response } from "express";
import WebhookService from "../services/webhook";

class WebhookController {
  async handlePaymentWebhook(req: Request, res: Response): Promise<void> {
    try {
      const result = await WebhookService.handleBankTransferWebhook(req.body);
      res.status(200).json({ message: "Xử lý thanh toán thành công", order: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new WebhookController();
