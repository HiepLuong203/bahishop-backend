export interface ReviewAttributes {
  review_id: number;
  product_id: number;
  user_id: number;
  order_id: number;
  rating: number;
  comment?: string;
  review_date?: Date;
}