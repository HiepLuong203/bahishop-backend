// src/types/productBatch.ts

export type ProductBatchStatus = 'available' | 'expired' | 'quarantined' | 'sold_out';

export interface ProductBatchAttributes {
  id: number;
  product_id: number;
  batch_code: string;
  manufacture_date?: Date;
  expiry_date: Date;
  quantity: number;
  import_price: number;
  import_date: Date;
  status: ProductBatchStatus; 
  createdAt?: Date;
  updatedAt?: Date;
}

// Kiểu dữ liệu cho việc cập nhật status
export interface UpdateBatchStatusPayload {
  newStatus: ProductBatchStatus;
}

// Kiểu dữ liệu cho việc điều chỉnh số lượng lô (nếu bạn muốn thêm tính năng này)
export interface AdjustBatchQuantityPayload {
  quantityChange: number; 
  reason?: string; // Lý do điều chỉnh
}
export enum ProductBatchStatusEnum {
  Available = 'available',
  Expired = 'expired',
  Quarantined = 'quarantined',
  SoldOut = 'sold_out',
}