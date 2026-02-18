const express = require("express");
const { checkAuth } = require("../../middleware/auth");
const router = express.Router();

const {
    getAllLogsController,
    getLogsByUserController
} = require("../../controllers/logController");

router.get("/", checkAuth, getAllLogsController);
router.get("/user/:userId", checkAuth, getLogsByUserController);

module.exports = router;