import multer, { StorageEngine, Multer, FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// nơi lưu file
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file theo thời gian
  },
});

// Bộ lọc file
const fileFilter = (req: Request, file: Express.Multer.File, cb: any): void => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
      false
    );
  }
};

// Cấu hình Multer
const uploadImages: Multer = multer({ storage, fileFilter });

export default uploadImages;
