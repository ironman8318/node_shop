const fs = require("fs");
const path = require("path");
const p = path.join(path.dirname(process.mainModule.filename), "data", "cart.json");
const Product = require("./product_fs");

const get = (cb) => {
    fs.readFile(p, (err, data) => {
        let cart = {
            products: [],
            totalPrice: 0,
        };
        if (!err) {
            cart = JSON.parse(data);
        }
        cb(cart);
    })
}
module.exports = class Cart {

    static addToCart(id, productPrice) {
        get(cart => {
            let totalPrice = cart.totalPrice;
            let products = cart.products;
            let product = products.find(el => el.id === +id);
            let index = products.findIndex(el => el.id === +id);
            totalPrice = totalPrice + +productPrice;
            if (product) {
                product = {
                    ...product,
                    qty: product.qty + 1,
                }
            } else {
                product = {
                    ...product,
                    id: id,
                    qty: 1,
                }
            }
            if (index >= 0) {
                products[index] = product
            } else {
                products = products.concat(product);
            }

            cart = {
                ...cart,
                products: products,
                totalPrice: totalPrice
            }
            fs.writeFile(p, JSON.stringify(cart), err => {})

        })
    }

    static fetchAll(cb) {
        get(cart => {

            cb(cart.products);
        })
    }


    static deleleFromCart(id, price, cb) {
        get(cart => {
            const product = cart.products.find(el => el.id === id);
            if (product) {
                const products = cart.products.filter(el => el.id !== id);
                const qty = product.qty;
                const totalPrice = cart.totalPrice - (qty * price);
                cart = {
                    ...cart,
                    products: products,
                    totalPrice: totalPrice,
                }

                fs.writeFile(p, JSON.stringify(cart), err => {
                    if (!err) cb();
                })

            } else {
                cb();
            }


        })
    }
}