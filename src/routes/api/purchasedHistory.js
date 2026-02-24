const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../middleware/auth.js")
const {
	getAllPurchasedHistory,
	getPurchasedHistoryByUser
} = require("../../controllers/purchasedHistory.controller")



router.get("/", checkAuth, getAllPurchasedHistory)
router.get("/user/:id", checkAuth, getPurchasedHistoryByUser)

module.exports = router