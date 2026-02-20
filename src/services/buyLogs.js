const buyLogsModel = require("../models/buyLogs")
const userModel = require("../models/userModel")

class BuyLogsService {
    async createLog (logData, session = null){
        try {
            const products = Array.isArray(logData.products) ? logData.products : []
            const calculatedTotal = products.reduce((sum, product) => {
                const quantity = Number(product?.quantity) || 1
                const price = Number(product?.price) || 0
                return sum + (price * quantity)
            }, 0)

            const normalizedLogData = {
                ...logData,
                totalCost: Number(logData.totalCost) > 0 ? Number(logData.totalCost) : calculatedTotal,
                isPaid: Boolean(logData.isPaid)
            }

            await buyLogsModel.create([normalizedLogData], { session })

            // Si isPaid es false  agregaremos la deuda al usuario
            if (!normalizedLogData.isPaid && normalizedLogData.totalCost > 0) {
                const updatedUser = await userModel.findByIdAndUpdate(
                    normalizedLogData.id_user,
                    { $inc: { debt: normalizedLogData.totalCost } },
                    { new: true, session }
                )
            }

            return "Ok"
        } catch (error) {
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
                    // crea fecha en formato local YYYY-MM-DD + hora 00:00:00
                    const start = new Date(from + 'T00:00:00')
                    if (!Number.isNaN(start.getTime())) {
                        query.createdAt.$gte = start
                    }
                }

                if (hasTo) {
                    // crea fecha en formato local YYYY-MM-DD + hora 23:59:59
                    const end = new Date(to + 'T23:59:59.999')
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

    async getPendingLogs(page = 1, limit = 10, from = "", to = "") {
        try {
            const safePage = Number(page) > 0 ? Number(page) : 1
            const safeLimit = Number(limit) > 0 ? Number(limit) : 10

            const query = { isPaid: false }
            const hasFrom = String(from || "").trim()
            const hasTo = String(to || "").trim()

            if (hasFrom || hasTo) {
                query.createdAt = {}

                if (hasFrom) {
                    // crea fecha en formato local YYYY-MM-DD + hora 00:00:00
                    const start = new Date(from + 'T00:00:00')
                    if (!Number.isNaN(start.getTime())) {
                        query.createdAt.$gte = start
                    }
                }

                if (hasTo) {
                    // crea fecha en formato local YYYY-MM-DD + hora 23:59:59
                    const end = new Date(to + 'T23:59:59.999')
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

            const logsForDebt = await buyLogsModel
                .find(query)
                .select("id_user totalCost products")
                .lean()

            const debtByUser = logsForDebt.reduce((acc, log) => {
                const userId = String(log.id_user)
                const fallbackAmount = Array.isArray(log.products)
                    ? log.products.reduce((sum, product) => {
                        const quantity = Number(product?.quantity) || 1
                        const price = Number(product?.price) || 0
                        return sum + (price * quantity)
                    }, 0)
                    : 0

                const purchaseAmount = Number(log.totalCost) > 0 ? Number(log.totalCost) : fallbackAmount
                acc[userId] = (acc[userId] || 0) + purchaseAmount
                return acc
            }, {})

            const docs = await buyLogsModel
                .find(query)
                .populate("id_user", "firstName lastName username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean()

            const debtorDocs = docs.map((doc) => {
                const userId = String(doc.id_user?._id || doc.id_user)
                const fallbackAmount = Array.isArray(doc.products)
                    ? doc.products.reduce((sum, product) => {
                        const quantity = Number(product?.quantity) || 1
                        const price = Number(product?.price) || 0
                        return sum + (price * quantity)
                    }, 0)
                    : 0

                const purchaseAmount = Number(doc.totalCost) > 0 ? Number(doc.totalCost) : fallbackAmount
                const userName = doc.id_user
                    ? `${doc.id_user.firstName} ${doc.id_user.lastName}`.trim()
                    : "Usuario"

                return {
                    ...doc,
                    userName,
                    purchaseAmount,
                    totalDebt: debtByUser[userId] || purchaseAmount
                }
            })

            return {
                docs: debtorDocs,
                totalDocs,
                limit: safeLimit,
                page: safePage,
                totalPages,
                hasPrevPage: safePage > 1,
                hasNextPage: safePage < totalPages
            }
        } catch (error) {
            throw new Error("Error obteniendo pendientes de pago")
        }
    }

    async markLogAsPaid(id) {
        try {
            const updatedLog = await buyLogsModel
                .findByIdAndUpdate(id, { isPaid: true }, { new: true })
                .populate("id_user", "firstName lastName username")

            if (!updatedLog) {
                throw new Error("Registro de compra no encontrado")
            }

            return updatedLog
        } catch (error) {
            throw new Error(error.message || "Error marcando compra como pagada")
        }
    }
}

module.exports = new BuyLogsService()