const mongoose = require("mongoose")
const buysLogsSchema = new mongoose.Schema({
    id_user: {
        type: Object,
        required: true
    },
    products: [{
        id: Object,
        name: String,
        price: Number
    }]

}, {
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model("BuyLogs", buysLogsSchema)