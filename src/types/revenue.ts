// src/types/revenue.ts

export interface RevenueSummary {
  actualRevenue: number; // Doanh thu thực tế (delivered & paid)
  pendingRevenue: number; // Doanh thu tạm tính (chưa delivered HOẶC chưa paid)
  totalPurchaseCost: number; // Tổng chi phí nhập hàng
  grossProfit: number; // Lợi nhuận gộp (actualRevenue - totalPurchaseCost)
}

export interface RevenueTrendData {
  label: string; // Ex: "2023-01", "2023-01-01"
  revenue: number; // Doanh thu thực tế (cho xu hướng)
  cost: number; // Chi phí nhập hàng (cho xu hướng)
  profit: number; // Lợi nhuận gộp (cho xu hướng)
}

export interface TopSellingProduct {
  product_id: number;
  name: string;
  unit: string;
  total_quantity_sold: number;
  total_revenue_from_product: number;
}

export type TimeInterval = 'day' | 'month' | 'year';