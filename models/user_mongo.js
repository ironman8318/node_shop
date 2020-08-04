const database = require("../util/database");
const mongodb = require("mongodb");

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        const db = database.getdb();
        return db.collection("users").insertOne(this)
    }

    addToCart(prod) {
        const existingProd = this.cart.items.findIndex(el => el.productId.toString() === prod._id.toString());
        const updatedItems = [
            ...this.cart.items
        ];
        let quantity = 1;
        if (existingProd >= 0) {
            quantity = updatedItems[existingProd].quantity + 1;
            updatedItems[existingProd] = {
                ...updatedItems[existingProd],
                quantity: quantity,
            }
        } else {
            updatedItems.push({
                productId: id(prod._id),
                quantity: quantity
            })
        }
        const updatedCart = {
            items: updatedItems
        }
        const db = database.getdb();
        return db.collection("users").updateOne({
            _id: id(this._id)
        }, {
            $set: {
                cart: updatedCart
            }
        }).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        })

    }
    getCart() {
        const prodIds = this.cart.items.map(el => {
            return id(el.productId);
        })
        console.log(prodIds);
        const db = database.getdb();
        return db.collection("products").find({
            _id: {
                $in: prodIds
            }
        }).toArray().then(res => {
            console.log(res);
            return res.map(el => {
                const {
                    quantity
                } = this.cart.items.find(ele => ele.productId.toString() === el._id.toString())
                console.log("2132131");
                console.log(el);
                return {
                    ...el,
                    quantity: quantity,
                }

            })
        }).catch(err => {
            console.log(err);
        })

    }

    deleteCart(id) {
        const updatedCartItems = this.cart.items.filter(el => el.productId.toString() === id.toString());
        const db = database.getdb();
        return db.collection("users").updateOne({
            _id: new mongodb.ObjectId(this._id)
        }, {
            $set: {
                cart: {
                    items: updatedCartItems
                }
            }
        })
    }

    getOrder() {
        const db = database.getdb();
        return db.collection("orders").find({
            'user._id': new mongodb.ObjectId(this._id)
        }).toArray().then(res => {
            console.log(res);
            return res;
        }).catch(err => {
            console.log(err);
        });
    }

    addOrder() {
        const db = database.getdb();
        return this.getCart().then(prods => {
            const order = {
                items: prods,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.username,
                }
            }
            return db.collection("orders").insertOne(order);
        }).then(res => {
            return db.collection("users").updateOne({
                _id: new mongodb.ObjectId(this._id)
            }, {
                $set: {
                    cart: {
                        items: []
                    }
                }
            }).then(rr => {
                return rr;
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })
    }

    static findById(id) {
        const db = database.getdb();
        return db.collection("users").find({
            _id: new mongodb.ObjectId(id)
        }).next().then(res => {
            console.log(res);
            return res;
        }).catch(err => {
            console.log(err);
        });
    }

}



const id = (id) => new mongodb.ObjectId(id);

module.exports = User;