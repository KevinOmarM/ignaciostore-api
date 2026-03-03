const mongoose = require("mongoose")
const cartSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }  
})

cartSchema.index({ user_id: 1, product_id: 1 }, { unique: true })

module.exports = mongoose.model("Cart", cartSchema)