const userModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

class authService {
    async login(username, password) {
        try {
            const userData = await userModel.findOne({ username })
            if (!userData) {
                throw new Error("Credenciales Invalidas")
            }

            const isValidPassword = await bcrypt.compare(password, userData.password)
            if (!isValidPassword) {
                throw new Error("Credenciales Invalidas")
            }

            if (userData.status === "inactive") throw new Error("Usuario inactivo");

            const expirationTime = userData.role === "admin" ? "24h" : "8h";

            const token = jwt.sign(
                {
                    userId: userData._id,
                    username: userData.username,
                    role: userData.role
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: expirationTime }
            )

            return token
        } catch (error) {
            throw new Error("Error al iniciar sesion: " + error.message)
        }
    }
}

module.exports = new authService()
