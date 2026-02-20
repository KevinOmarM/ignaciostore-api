const buyLogsModel = require("../models/buyLogs")

class BuyLogsService {
    async createLog (logData){
        try {
            await buyLogsModel.create(logData)
            return "Ok"
        } catch (error) {
            console.error("ERROR REAL CREATE LOG:", error)
            throw new Error("Error creando el registro de compra")
        }
    }

    async getAllLogs(){
        try {
            const logs = await buyLogsModel.find()
            return logs
        } catch (error) {
            throw new Error("Error obteniendo los registros de compra")
        }
    }

    async getLogById(id){
        try {
            const log = await buyLogsModel.findById(id)
            return log
        } catch (error) {
            throw new Error("Error obteniendo el registro de compra")
        }
    }

    async getLogByUserId(userId, page = 1, limit = 10, from = "", to = ""){
        try {
            const safePage = Number(page) > 0 ? Number(page) : 1
            const safeLimit = Number(limit) > 0 ? Number(limit) : 10
            const query = { id_user: userId }

            const hasFrom = String(from || "").trim()
            const hasTo = String(to || "").trim()

            if (hasFrom || hasTo) {
                query.createdAt = {}

                if (hasFrom) {
                    const start = new Date(from)
                    start.setHours(0, 0, 0, 0)
                    if (!Number.isNaN(start.getTime())) {
                        query.createdAt.$gte = start
                    }
                }

                if (hasTo) {
                    const end = new Date(to)
                    end.setHours(23, 59, 59, 999)
                    if (!Number.isNaN(end.getTime())) {
                        query.createdAt.$lte = end
                    }
                }

                if (!query.createdAt.$gte && !query.createdAt.$lte) {
                    delete query.createdAt
                }
            }

            const totalDocs = await buyLogsModel.countDocuments(query)
            const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit))
            const skip = (safePage - 1) * safeLimit

            const docs = await buyLogsModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)

            return {
                docs,
                totalDocs,
                limit: safeLimit,
                page: safePage,
                totalPages,
                hasPrevPage: safePage > 1,
                hasNextPage: safePage < totalPages
            }
        } catch (error) {
            throw new Error("Error obteniendo el registro de compra")
        }
    }

    async getMonthlyLogs(month, year) {

        const m = Number(month)
        const y = Number(year)

        if (!m || !y)
            throw new Error("Mes y año son requeridos")

        if (m < 1 || m > 12)
            throw new Error("Mes inválido")

        const start = new Date(y, m - 1, 1)
        const end = new Date(y, m, 1)

        if (isNaN(start) || isNaN(end))
            throw new Error("Fecha inválida generada")

        return await buyLogsModel.find({
            createdAt: {
                $gte: start,
                $lt: end
            }
        }).populate("id_user", "name username")
    }
}

module.exports = new BuyLogsService()