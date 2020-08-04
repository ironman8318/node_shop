const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    },

})

userSchema.methods.addToCart = function (prodId) {
    const index = this.cart.items.findIndex(p => p.productId.toString() === prodId.toString());
    const updatedCartItems = [...this.cart.items];
    let quantity = 1;
    if (index >= 0) {

        updatedCartItems[index].quantity += 1;
    } else {
        updatedCartItems.push({
            productId: prodId,
            quantity: quantity
        })
    }
    this.cart = {
        items: updatedCartItems
    };
    return this.save();

}

userSchema.methods.deleteCart = function (prodId) {
    console.log(prodId);
    const updatedCartItems = this.cart.items.filter(p => p.productId.toString() !== prodId.toString());
    console.log(updatedCartItems)
    this.cart.items = updatedCartItems;
    return this.save();
}

module.exports = mongoose.model("User", userSchema);