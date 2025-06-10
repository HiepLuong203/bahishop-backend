// src/services/revenueService.ts
import { Op, literal } from 'sequelize';
import Order from '../models/order';
import PurchaseOrder from '../models/purchaseOrder';
import OrderItem from '../models/orderItem';
import Product from '../models/product';
import {OrderStatus,PaymentStatus} from '../types/order';
import { RevenueSummary, RevenueTrendData, TopSellingProduct } from '../types/revenue';

export default class RevenueService {

//     Tính toán tổng doanh thu thực tế, doanh thu tạm tính và tổng chi phí nhập hàng.
  static async getOverallRevenueSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<RevenueSummary> {
    const commonDateWhereClause: any = {};
    if (startDate && endDate) {
      commonDateWhereClause.order_date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      commonDateWhereClause.order_date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      commonDateWhereClause.order_date = {
        [Op.lte]: endDate,
      };
    }

    //Tính toán Doanh thu thực tế 
    const actualRevenueWhereClause = {
      ...commonDateWhereClause,
      order_status: OrderStatus.Delivered,
      payment_status: PaymentStatus.Paid,
    };
    const actualRevenueResult = await Order.sum('total_amount', {
      where: actualRevenueWhereClause,
    });
    const actualRevenue = parseFloat(actualRevenueResult as any) || 0;

    // Tính toán Doanh thu tạm tính 
    const totalOrderRevenueResult = await Order.sum('total_amount', {
      where: commonDateWhereClause,
    });
    const totalOrderRevenue = parseFloat(totalOrderRevenueResult as any) || 0;
    const pendingRevenue = totalOrderRevenue - actualRevenue;


    // Tính toán Tổng chi phí nhập hàng
    const totalPurchaseCostResult = await PurchaseOrder.sum('total_amount', {
      where: commonDateWhereClause,
    });
    const totalPurchaseCost = parseFloat(totalPurchaseCostResult as any) || 0;

    const grossProfit = actualRevenue - totalPurchaseCost; // Lợi nhuận gộp tính trên doanh thu thực tế

    return {
      actualRevenue,
      pendingRevenue,
      totalPurchaseCost,
      grossProfit,
    };
  }
     
   //Lấy dữ liệu xu hướng doanh thu và chi phí theo khoảng thời gian.
  
  static async getRevenueTrend(
    interval: 'day' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date
  ): Promise<RevenueTrendData[]> {
    const commonDateWhereClause: any = {};
    if (startDate && endDate) {
      commonDateWhereClause.order_date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      commonDateWhereClause.order_date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      commonDateWhereClause.order_date = {
        [Op.lte]: endDate,
      };
    }

    let dateFormat: string;
    let groupByOrder: any;
    let groupByPurchaseOrder: any;

    switch (interval) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupByOrder = literal(`DATE_FORMAT(Order.order_date, '${dateFormat}')`);
        groupByPurchaseOrder = literal(`DATE_FORMAT(PurchaseOrder.order_date, '${dateFormat}')`);
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupByOrder = literal(`DATE_FORMAT(Order.order_date, '${dateFormat}')`);
        groupByPurchaseOrder = literal(`DATE_FORMAT(PurchaseOrder.order_date, '${dateFormat}')`);
        break;
      case 'year':
        dateFormat = '%Y';
        groupByOrder = literal(`DATE_FORMAT(Order.order_date, '${dateFormat}')`);
        groupByPurchaseOrder = literal(`DATE_FORMAT(PurchaseOrder.order_date, '${dateFormat}')`);
        break;
      default:
        throw new Error('Invalid interval. Must be "day", "month", or "year".');
    }

    // Lấy doanh thu thực tế theo xu hướng
    const actualRevenueTrend = await Order.findAll({
      attributes: [
        [groupByOrder, 'label'],
        [literal('SUM(total_amount)'), 'revenue'],
      ],
      where: {
        ...commonDateWhereClause,
        order_status: OrderStatus.Delivered,
        payment_status: PaymentStatus.Paid,
      },
      group: [groupByOrder],
      order: [[groupByOrder, 'ASC']],
      raw: true,
    });

    // Lấy chi phí nhập hàng theo xu hướng
    const purchaseCostTrend = await PurchaseOrder.findAll({
      attributes: [
        [groupByPurchaseOrder, 'label'],
        [literal('SUM(total_amount)'), 'cost'],
      ],
      where: commonDateWhereClause,
      group: [groupByPurchaseOrder],
      order: [[groupByPurchaseOrder, 'ASC']],
      raw: true,
    });

    // Kết hợp dữ liệu doanh thu và chi phí
    const combinedData: { [key: string]: RevenueTrendData } = {};

    actualRevenueTrend.forEach((row: any) => {
      const label = row.label;
      combinedData[label] = {
        label: label,
        revenue: parseFloat(row.revenue) || 0,
        cost: 0,
        profit: 0,
      };
    });

    purchaseCostTrend.forEach((row: any) => {
      const label = row.label;
      if (combinedData[label]) {
        combinedData[label].cost = parseFloat(row.cost) || 0;
      } else {
        combinedData[label] = {
          label: label,
          revenue: 0,
          cost: parseFloat(row.cost) || 0,
          profit: 0,
        };
      }
    });

    // Tính lợi nhuận và chuyển đổi thành mảng
    const result: RevenueTrendData[] = Object.values(combinedData)
      .map(data => ({
        ...data,
        profit: data.revenue - data.cost,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Sắp xếp lại theo label (ngày/tháng/năm)

    return result;
  }
// Lấy danh sách sản phẩm bán chạy nhất theo khoảng thời gian và giới hạn số lượng.
  static async getTopSellingProducts(limit: number = 10,startDate?: Date,endDate?: Date): Promise<any> {
    const whereClause: any = {
      order_status: OrderStatus.Delivered,
      payment_status: PaymentStatus.Paid,
    };

    if (startDate && endDate) {
      whereClause.order_date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereClause.order_date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereClause.order_date = {
        [Op.lte]: endDate,
      };
    }

    // Dùng OrderItem join Order và Product, group theo product_id, tính tổng quantity
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        [literal('SUM(quantity)'), 'total_quantity_sold'],
        [literal('SUM(quantity * unit_price)'), 'total_revenue_from_product'],
      ],
      include: [
      
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'unit'],
        },
      ],
      group: ['product_id', 'product.product_id', 'product.name', 'product.unit'],
      having: literal('SUM(quantity) > 10'),
      order: [[literal('total_revenue_from_product'), 'DESC']],
      limit,
      raw: true,
      nest: true, // để trả về nested object cho product
    });

    return topProducts.map((item: any) => ({
      product_id: item.product_id,
      name: item.product.name,
      unit: item.product.unit,
      total_quantity_sold: parseInt(item.total_quantity_sold, 10) || 0,
      total_revenue_from_product: parseFloat(item.total_revenue_from_product) || 0,
    }));
  }
}
