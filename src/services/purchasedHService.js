const mongoose = require("mongoose");
const buyLogsModel = require("../models/buyLogs");

class PurchasedHistoryService {
  buildDateFilter({ from = "", to = "" }) {
    const dateFilter = {};
    const hasFrom = String(from || "").trim();
    const hasTo = String(to || "").trim();

    if (hasFrom) {
      const start = new Date(`${from}T00:00:00`);
      if (!Number.isNaN(start.getTime())) {
        dateFilter.$gte = start;
      }
    }

    if (hasTo) {
      const end = new Date(`${to}T23:59:59.999`);
      if (!Number.isNaN(end.getTime())) {
        dateFilter.$lte = end;
      }
    }

    return dateFilter;
  }

  async getAll({ page = 1, limit = 10, from = "", to = "" } = {}) {
    try {
      const safePage = Number(page) > 0 ? Number(page) : 1;
      const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
      const query = {};

      const dateFilter = this.buildDateFilter({ from, to });
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      const totalDocs = await buyLogsModel.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit));
      const skip = (safePage - 1) * safeLimit;

      const docs = await buyLogsModel
        .find(query)
        .populate("id_user", "firstName lastName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean();

      return {
        docs,
        totalDocs,
        limit: safeLimit,
        page: safePage,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      };
    } catch (error) {
      throw new Error(`Error obteniendo historial de compras: ${error.message}`);
    }
  }

  async getByUserId(userId, { page = 1, limit = 10, from = "", to = "" } = {}) {
    try {
      const safePage = Number(page) > 0 ? Number(page) : 1;
      const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
      const query = {};

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("ID de usuario inválido");
      }
      query.id_user = new mongoose.Types.ObjectId(userId);

      const dateFilter = this.buildDateFilter({ from, to });
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      const totalDocs = await buyLogsModel.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit));
      const skip = (safePage - 1) * safeLimit;

      const docs = await buyLogsModel
        .find(query)
        .populate("id_user", "firstName lastName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean();

      return {
        docs,
        totalDocs,
        limit: safeLimit,
        page: safePage,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      };
    } catch (error) {
      throw new Error(`Error obteniendo historial de compras del usuario: ${error.message}`);
    }
  }
}

module.exports = new PurchasedHistoryService();
