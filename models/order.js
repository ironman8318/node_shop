const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orders: [{
        product: {
            type: Object,
            ref: "Product"
        },
        quantity: Number
    }],
    user: {
        name: {
            type: String,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }
})

module.exports = mongoose.model("Order", orderSchema)