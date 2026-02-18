const authService = require("../services/auth")
const { getUserByUsernameService } = require("../services/userService")
const { customResponse } = require("../helpers/objectDataResponse")
const logService = require("../services/logService")

const loginController = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await getUserByUsernameService(username)
        if (!user) {
            return customResponse(res, 404, "Usuario no encontrado", null)
        }
        const result = await authService.login(username, password)
        await logService.createLog(user.id, "Iniciar sesión", `Usuario ${user.username} inició sesión`)
        customResponse(res, 200, "Ok", result)
    } catch (error) {
        customResponse(res, 500, "Error al iniciar sesion", null, error.message)
        throw new Error(error.message)
    }
}

module.exports = {
    loginController
}