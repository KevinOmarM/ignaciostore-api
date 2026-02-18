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
            const logs = await buyLogsModel.findAll()
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
            const log = await buyLogsModel.findByUserId(userId)
            return log
        } catch (error) {
            throw new Error("Error obteniendo el registro de compra")
        }
    }
}

module.exports = new BuyLogsService()