const buyLogsService = require("../services/buyLogs")
const { customResponse } = require("../helpers/objectDataResponse")

const createLog = async (req, res) => {
    try {
        const logData = req.body
        const log = await buyLogsService.craeteLog(logData)
        customResponse(res, 201, log, "Registro de compra creado exitosamente")
    } catch (error) {
        customResponse(res, 500, null, "Error creando el registro de compra")
    }
}

const getLogs = async (req, res) => {
    try {
        const logs = await buyLogsService.getLogs()
        customResponse(res, 200, logs, "Registros de compras obtenidos exitosamente")
    } catch (error) {
        customResponse(res, 500, null, "Error obteniendo los registros de compras")
    }
}

const getLogsById = async (req, res) => {
    try {
        const { id } = req.params
        const log = await buyLogsService.getLogById(id)
        customResponse(res, 200, log, "Registro de compra obtenido exitosamente")
    } catch (error) {
        customResponse(res, 500, null, "Error obteniendo el registro de compra")
    }
}

const getLogsByUserId = async (req, res) => {
    try {
        const { id } = req.params
        const logs = await buyLogsService.getLogByUserId(id)
        customResponse(res, 200, logs, "Registros de compras obtenidos exitosamente")
    } catch (error) {
        customResponse(res, 500, null, "Error obteniendo los registros de compras")
    }
}

module.exports = {
    createLog,
    getLogs,
    getLogsById,
    getLogsByUserId
}