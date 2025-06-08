export interface OrderInput {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  payment_method: "cod" | "bank_transfer";
  payment_status: PaymentStatus;
  notes?: string;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_price?: number;
  total_price: number;
}
export enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
}