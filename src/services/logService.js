const Log = require("../models/logModel.js");
const mongoose = require("mongoose");
const User = require("../models/userModel.js");


class LogService {
    async createLog(authorId, action, value){
        try {
            const newLog = new Log({
                author: authorId,
                action: action,
                value: value
            });
             await newLog.save();

            return newLog
        } catch (error) {
            throw new Error("Error al crear el log: " + error.message)
        }
    }

    async getAllLogs(page = 1, limit = 10){
        try {
            const options = {
                sort: { createdAt: -1 },
                populate: {
                    path: "author",
                    select: "username"
                },
                select: "-__v"
            }
            if (page && limit) {
                options.page = page;
                options.limit = limit;
            }
            const logs = await Log.paginate({}, options)
            return logs
        } catch (error) {
            throw new Error("Error al obtener los logs: " + error.message)
        }
    }

    async getLogsByUser(userId, options = {page: 1, limit: 10}){
        try {
            const { page, limit } = options
            const logs = await Log.paginate(
                { id_user: mongoose.Types.ObjectId(userId) },
                {page, limit, sort: { createdAt: -1 }}
            );

            return logs
        } catch (error) {
            throw new Error("Error al obtener los logs del usuario: " + error.message)
        }
    }
}

module.exports = new LogService()