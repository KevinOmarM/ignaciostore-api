const jwt = require("jsonwebtoken")
const { customResponse } = require("../helpers/objectDataResponse.js")

const checkAuth = (req, res, next) => {
    try {
        const header = req.headers.authorization
        if (!header) {
            return customResponse(res, 401, null, "No autorizado")
        }

        const token = header.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        req.user = decoded
        next()
    } catch (error) {
        return customResponse(res, 401, null, "Token inválido")
    }
}

module.exports = {
    checkAuth
}