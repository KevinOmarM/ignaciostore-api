const buyLogsService = require("../services/buyLogs")
const { customResponse } = require("../helpers/objectDataResponse")
const { generateMonthlyExcel } = require("../utils/excelGenerator")

const createLog = async (req, res) => {
    try {
        const logData = req.body
        const log = await buyLogsService.createLog(logData)
        customResponse(res, 201, log, "Registro de compra creado exitosamente")
    } catch (error) {
        customResponse(res, 500, null, "Error creando el registro de compra")
    }
}

const getLogs = async (req, res) => {
    try {
        const logs = await buyLogsService.getAllLogs()
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

const downloadMonthlyReport = async (req, res) => {
    try {

        const { month, year } = req.params

        const logs = await buyLogsService.getMonthlyLogs(month, year)

        const workbook = await generateMonthlyExcel(logs)

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=reporte-${month}-${year}.xlsx`
        )

        await workbook.xlsx.write(res)
        res.end()

    } catch (error) {
        console.error("REPORTE ERROR:", error)
        customResponse(res, 500, null, "Error descargando el reporte mensual")
    }
}

module.exports = {
    createLog,
    getLogs,
    getLogsById,
    getLogsByUserId,
    downloadMonthlyReport
}