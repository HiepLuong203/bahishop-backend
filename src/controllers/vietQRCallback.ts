// src/controllers/vietQRCallback.ts
import { Request, Response } from "express";
import VietQRCallbackService from "../services/vietQRCallback";

class VietQRCallbackController {
  async handleVietQRCallback(req: Request, res: Response): Promise<void> {
    console.log("VietQRCallbackController: Đã nhận callback từ VietQR/Cổng thanh toán.");
    try {
      const callbackData = req.body;

      const result = await VietQRCallbackService.processVietQRCallback(callbackData);


      res.status(200).json({
        RspCode: "00", 
        Message: "Success",
        Data: result,
      });

    } catch (error: any) {
      console.error("VietQRCallbackController: Lỗi khi xử lý callback VietQR:", error.message);
      res.status(400).json({
        RspCode: "99", 
        Message: error.message,
      });
    }
  }
}

export default new VietQRCallbackController();