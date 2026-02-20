const mongoose = require("mongoose")
const buysLogsSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalCost: {
        type: Number,
        default: 0,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    products: [{
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number
    }]

}, {
    timestamps: true,
    versionKey: false
})

buysLogsSchema.index({ isPaid: 1, createdAt: -1, id_user: 1 })

module.exports = mongoose.model("BuyLogs", buysLogsSchema)