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

    async getLogByUserId(userId){
        try {
            const log = await buyLogsModel.find({id_user: userId})
            return log
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