const mongoose = require("mongoose")
const buysLogsSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number
    }]

}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model("BuyLogs", buysLogsSchema)