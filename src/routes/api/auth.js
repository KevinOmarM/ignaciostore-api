const expess = require("express")
const router = expess.Router()
const {
    loginController
} = require("../../controllers/authController")

router.post("/login", loginController)

module.exports = router