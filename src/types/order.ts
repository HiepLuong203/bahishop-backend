export interface OrderInput {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  payment_method: string;
  notes?: string;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_price?: number;
  total_price: number;
}
