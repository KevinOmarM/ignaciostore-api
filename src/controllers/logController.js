const logService = require("../services/logService.js");
const { customResponse } = require("../../helpers/objectDataResponse.js")

const getAllLogsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const logs = await logService.getAllLogs(page, limit)
        customResponse(res, 200, logs, "Logs obtenidos exitosamente")
    } catch (error) {
        customResponse(res, 500, error, "Error al obtener los logs")
    }
};

const getLogsByUserController = async (req, res) => {
    try {
        const { userId } = req.params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const logs = await logService.getLogsByUser(userId, { page, limit })
        customResponse(res, 200, logs, "Logs del usuario obtenidos exitosamente")

    } catch (error) {
        customResponse(res, 500, error, "Error al obtener los logs del usuario")
    }
}

module.exports = {
    getAllLogsController,
    getLogsByUserController
}