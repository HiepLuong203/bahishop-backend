export interface PurchaseOrderAttributes {
  id?: number;
  supplier_id: number;  
  order_date: Date;  
  note?: string; 
  createdAt?: Date;
  updatedAt?: Date;
  total_amount?: number;
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
