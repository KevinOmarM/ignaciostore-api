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
        customResponse(res, 200, result, "Ok")
    } catch (error) {
        console.error(error)
        if (error.message.includes("Credenciales Invalidas")) return customResponse(res, 401, {}, "Credenciales Invalidas");
        if (error.message.includes("Usuario inactivo")) return customResponse(res, 403, {}, "Usuario inactivo");
        return customResponse(res, 500, {}, null, "Error al iniciar sesión")
    }
}

module.exports = {
    loginController
}