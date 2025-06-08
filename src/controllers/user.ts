import { Request, Response } from "express";
import UserService from "../services/user";

class UserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({
        message: "Đăng ký thành công.",
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const { token, user } = await UserService.login(username, password);
      res.status(200).json({
        message: "Đăng nhập thành công.",
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const user = await UserService.getProfile(userId);
      res.status(200).json(user);
      return;
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = req.body;
      const result = await UserService.updateProfile(userId, data);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      await UserService.verifyEmail(token as string);

      res.redirect("http://localhost:3000/profile");
    } catch (error: any) {
      res.redirect(`http://localhost:3000/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  static async forgetPassword(req: Request, res: Response) {
    try {
      const { username, email } = req.body;
      const result = await UserService.sendResetPasswordEmail(username, email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    try {
      const result = await UserService.resetPassword(token, newPassword);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const result = await UserService.changePassword(
        userId,
        oldPassword,
        newPassword,
        confirmPassword
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  static async getCustomerStats(req: Request, res: Response) {
    try {
      const result = await UserService.getAllCustomersSortedByCreatedAt();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

}

export default UserController;
