export interface PromotionAttributes{
    promotion_id: number;
    name: string;
    description?: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    start_date: Date;
    end_date: Date;
    min_order_amount?: number;
    is_active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
