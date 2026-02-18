const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../middleware/auth.js")
const {
    createLog,
    getLogs,
    getLogsById,
    getLogsByUserId,
    downloadMonthlyReport
} = require("../../controllers/buyLogsController")

router.post("/", checkAuth, createLog)
router.get("/", checkAuth, getLogs)
router.get("/:id", checkAuth, getLogsById)
router.get("/user/:id", checkAuth, getLogsByUserId)
router.get("/reports/monthly/:month/:year", checkAuth, downloadMonthlyReport)


module.exports = router