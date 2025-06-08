export interface PurchaseOrderAttributes {
  id?: number;
  supplier_id: number;  
  order_date: Date;  
  note?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}
export interface PurchaseOrderDetailAttributes {
  id?: number;
  purchase_order_id: number;  
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ProductInputForPurchaseOrder {
  product_id: number;
  quantity: number;
  unit_price: number;
  batch_code: string;       // Bắt buộc phải có mã lô
  manufacture_date?: string; // Có thể là string để parse từ frontend
  expiry_date: string;      // Bắt buộc phải có hạn sử dụng
}