const express = require("express");
const router = express.Router();

const {
    getAllLogsController,
    getLogsByUserController
} = require("../../controllers/logController");

router.get("/", getAllLogsController);
router.get("/user/:userId", getLogsByUserController);

module.exports = router;