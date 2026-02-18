const authService = require("../services/auth")
const { customResponse } = require("../../helpers/objectDataResponse")

const loginController = async (req, res) => {
    try {
        const { username, password } = req.body
        const result = await authService.login(username, password)
        customResponse(res, 200, "Ok", result)
    } catch (error) {
        customResponse(res, 500, "Error al iniciar sesion", null, error.message)
    }
}

module.exports = {
    loginController
}