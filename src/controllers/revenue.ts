// src/controllers/revenueController.ts
import { Request, Response } from 'express';
import RevenueService from '../services/revenue';
import { RevenueSummary, RevenueTrendData, TopSellingProduct, TimeInterval } from '../types/revenue'; // Import RevenueSummary đã cập nhật

class RevenueController {
  async getOverallSummary(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;

      if (typeof startDate === 'string' && startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (typeof endDate === 'string' && endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end && start > end) {
        res.status(400).json({ message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc." });
        return;
      }

      const summary: RevenueSummary = await RevenueService.getOverallRevenueSummary(start, end);
      res.status(200).json(summary);
    } catch (error: any) {
      console.error('Lỗi khi lấy tóm tắt doanh thu:', error);
      res.status(500).json({ error: error.message || 'Lỗi server nội bộ khi lấy tóm tắt doanh thu.' });
    }
  }

  async getRevenueTrend(req: Request, res: Response): Promise<void> {
    try {
      const { interval, startDate, endDate } = req.query;

      if (!interval || !['day', 'month', 'year'].includes(interval as string)) {
        res.status(400).json({ message: "Tham số 'interval' không hợp lệ. Phải là 'day', 'month' hoặc 'year'." });
        return;
      }

      let start: Date | undefined;
      let end: Date | undefined;

      if (typeof startDate === 'string' && startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (typeof endDate === 'string' && endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end && start > end) {
        res.status(400).json({ message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc." });
        return;
      }

      const trendData: RevenueTrendData[] = await RevenueService.getRevenueTrend(interval as TimeInterval, start, end);
      res.status(200).json(trendData);
    } catch (error: any) {
      console.error('Lỗi khi lấy xu hướng doanh thu:', error);
      res.status(500).json({ error: error.message || 'Lỗi server nội bộ khi lấy xu hướng doanh thu.' });
    }
  }

  async getTopSellingProducts(req: Request, res: Response): Promise<void> {
    try {
      const { limit, startDate, endDate } = req.query;
      const parsedLimit = limit ? Number(limit) : 10;

      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        res.status(400).json({ message: "Tham số 'limit' không hợp lệ. Phải là một số dương." });
        return;
      }

      let start: Date | undefined;
      let end: Date | undefined;

      if (typeof startDate === 'string' && startDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (typeof endDate === 'string' && endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (start && end && start > end) {
        res.status(400).json({ message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc." });
        return;
      }

      const topProducts: TopSellingProduct[] = await RevenueService.getTopSellingProducts(parsedLimit, start, end);
      res.status(200).json(topProducts);
    } catch (error: any) {
      console.error('Lỗi khi lấy sản phẩm bán chạy nhất:', error);
      res.status(500).json({ error: error.message || 'Lỗi server nội bộ khi lấy sản phẩm bán chạy nhất.' });
    }
  }
}

export default new RevenueController();