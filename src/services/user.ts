import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mailjet from "node-mailjet";
import { UpdateUserAttributes, RegisUserAttributes } from "../types/user";
import { Op } from "sequelize";
const JWT_SECRET = process.env.JWT_SECRET!;
class ServiceUser {
  static async register(data: Partial<RegisUserAttributes>) {
    if (!data.username || !data.email || !data.password_hash) {
      throw new Error("Thiếu thông tin bắt buộc.");
    }
    const existingUser = await User.findOne({
      where: { username: data.username },
    });
    if (existingUser) {
      throw new Error("Username đã tồn tại.");
    }

    const existingEmail = await User.findOne({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new Error("Email đã tồn tại.");
    }

    const password_hash = await bcrypt.hash(data.password_hash, 10);

    const user = await User.create({
      username: data.username,
      email: data.email,
      password_hash,
      is_active: false,
    });

    return user;
  }

  static async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error("Username hoặc mật khẩu không đúng.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error("Username hoặc mật khẩu không đúng.");
    }

    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user };
  }

  static async getProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["createdAt", "updatedAt", "password_hash"],
      },
    });
    return user;
  }
  static async updateProfile(
    userId: number,
    data: Partial<UpdateUserAttributes>
  ) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User không tồn tại.");
    }

    await user.update({
      full_name: data.full_name || user.full_name,
      phone_number: data.phone_number || user.phone_number,
      address: data.address || user.address,
    });
    if (data.send_verify_email && !user.is_active) {
      await ServiceUser.sendVerifyEmail(user);
    }
    if (data.send_verify_email && user.is_active) {
      throw new Error("Tài khoản đã được kích hoạt.");
    }
    return {
      message: "Cập nhật thông tin thành công.",
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        is_active: user.is_active,
      },
    };
  }
  static async sendVerifyEmail(user: any) {
    const EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET!;
    const token = jwt.sign({ userId: user.user_id }, EMAIL_VERIFY_SECRET, {
      expiresIn: "1d",
    });

    const mailjetClient = mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    );

    await mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: "atanysudo@gmail.com", Name: "BAHISHOP" },
          To: [{ Email: user.email, Name: user.username }],
          Subject: "Xác thực tài khoản",
          HTMLPart: `
                        <h3>Xin chào ${user.username},</h3>
                        <p>Vui lòng xác thực tài khoản bằng cách nhấn vào link bên dưới:</p>
                        <a href="http://localhost:5000/api/users/verifyemail?token=${token}"
                        style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        ">Xác thực tài khoản</a>
                    `,
        },
      ],
    });
  }
  static async verifyEmail(token: string) {
    const EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET!;

    const decoded: any = jwt.verify(token, EMAIL_VERIFY_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new Error("User không tồn tại.");
    }

    user.is_active = true;
    await user.save();

    return { message: "Xác thực tài khoản thành công." };
  }

  static async sendResetPasswordEmail( email: string) {
    const user = await User.findOne({
      where: {  email: email },
    });
    if (!user) throw new Error("Username hoặc Email không tồn tại.");

    const RESET_PASSWORD = process.env.DB_RESET_PASSWORD!;
    const token = jwt.sign({ userId: user.user_id }, RESET_PASSWORD, {
      expiresIn: "15m",
    });
    const mailjetClient = mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC!,
      process.env.MJ_APIKEY_PRIVATE!
    );

    await mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: "atanysudo@gmail.com", Name: "BAHISHOP" },
          To: [{ Email: user.email, Name: user.username }],
          Subject: "Khôi phục mật khẩu",
          HTMLPart: `
            <h3>Xin chào ${user.username},</h3>
            <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
            <a href="http://localhost:3000/reset-password?token=${token}&email=${user.email}"
            style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Đặt lại mật khẩu
            </a>
            `,
        },
      ],
    });

    return { message: "Email đặt lại mật khẩu đã được gửi.", token };
  }
  static async resetPassword(token: string, newPassword: string) {
    const RESET_PASSWORD_SECRET = process.env.DB_RESET_PASSWORD!;
    let payload: any;

    try {
      payload = jwt.verify(token, RESET_PASSWORD_SECRET);
    } catch (err) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    }

    const user = await User.findByPk(payload.userId);
    if (!user) throw new Error("Người dùng không tồn tại.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();

    return { message: "Mật khẩu đã được đặt lại thành công." };
  }
  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("Người dùng không tồn tại.");

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) throw new Error("Mật khẩu cũ không đúng.");

    if (newPassword !== confirmPassword) {
      throw new Error("Mật khẩu mới và xác nhận không khớp.");
    }
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Đổi mật khẩu thành công." };
  }
  static async getAllCustomersSortedByCreatedAt() {
    // Lấy ngày hiện tại theo 00:00:00 và 23:59:59
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Tìm tất cả user có role là customer và sắp xếp theo ngày tạo
    const customers = await User.findAll({
      where: { role: "customer" },
      order: [["created_at", "ASC"]],
    });

    // Lọc user có ngày tạo trong hôm nay
    const todayNewUsers = await User.count({
      where: {
        role: "customer",
        created_at: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    return {
      total_customers: customers.length,
      today_new_customers: todayNewUsers,
      customers,
    };
  }
}

export default ServiceUser;
