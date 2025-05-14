export interface ProductAttributes {
    product_id: number;
    name: string;
    description?: string;
    category_id?: number;
    price: number;
    discount_price?: number;
    stock_quantity?: number;
    unit: string;
    origin?: string;
    expiry_date?: Date;
    image_url?: string;
    rating?: number;
    view_count?: number;
    is_featured?: boolean;
    is_new?: boolean;
    is_active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    supplier_id?: number;
  }
  