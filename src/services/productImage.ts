import ProductImage from "../models/productImage";
import ServiceProduct from "../services/product";
import { ProductImageAttributes } from "../types/productImage";
export default class ServiceProductImage {
  static async createImagesToProduct(
    product_id: number,
    files: Express.Multer.File[]
  ) {
    await ServiceProduct.validateProductId(product_id);
  
    const images = files.map((file, index) => {
      console.log("Uploaded file:", file);  // Log kiểm tra từng file
      return {
        product_id,
        image_url: `/uploads/${file.filename}`,  // Đảm bảo file có đuôi
        display_order: index + 1,
      };
    });
  
    return ProductImage.bulkCreate(images);
  }  
  static async updateProductImage(
    image_id: number,
    data: Partial<ProductImageAttributes>,
    file: Express.Multer.File
  ) {
    await ServiceProduct.validateProductId(data.product_id ?? null);
    const image = await ProductImage.findByPk(image_id);
    if (!image) throw new Error("Image not found");
    // Nếu có file, cập nhật đường dẫn ảnh
    if (file) {
      console.log("Uploaded file (update):", file); 
      data.image_url = `/uploads/${file.filename}`;  
    }
  
    // Cập nhật thông tin ảnh
    await image.update(data);
    return image;
  }
  
  static async deleteProductImage(image_id: number) {
    const image = await ProductImage.findByPk(image_id);
    if (!image) throw new Error("Image not found");

    await image.destroy();
    return true;
  }
}
