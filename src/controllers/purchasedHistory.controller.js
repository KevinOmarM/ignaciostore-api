const { customResponse } = require("../helpers/objectDataResponse");
const purchasedHistoryService = require("../services/purchasedHService");

const getAllPurchasedHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { from = "", to = "" } = req.query;

        const history = await purchasedHistoryService.getAll({
            page,
            limit,
            from,
            to,
        });

        return customResponse(
            res,
            200,
            history,
            "Historial de compras obtenido exitosamente",
        );
    } catch (error) {
        console.error("Error en getAllPurchasedHistory controller:", error.message);

        if (error.message.includes("inválido")) {
            return customResponse(res, 400, null, error.message);
        }

        return customResponse(res, 500, null, "Error interno del servidor");
    }
};

const getPurchasedHistoryByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { from = "", to = "" } = req.query;

        const history = await purchasedHistoryService.getByUserId(id, {
            page,
            limit,
            from,
            to,
        });

        return customResponse(
            res,
            200,
            history,
            "Historial de compras del usuario obtenido exitosamente",
        );
    } catch (error) {
        console.error("Error en getPurchasedHistoryByUser controller:", error.message);

        if (error.message.includes("inválido")) {
            return customResponse(res, 400, null, error.message);
        }

        return customResponse(res, 500, null, "Error interno del servidor");
    }
};

module.exports = {
  getAllPurchasedHistory,
  getPurchasedHistoryByUser,
};
