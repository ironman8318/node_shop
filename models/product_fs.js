const fs = require("fs");
const path = require("path");
const p = path.join(path.dirname(process.mainModule.filename), "data", "products.json");
const Cart = require("./cart_fs");
const get = (cb) => {
    fs.readFile(p, (err, data) => {
        let products = [];
        if (!err) {
            products = JSON.parse(data);
        }
        cb(products);
    })
}
module.exports = class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.id = id;
    }

    save(cb) {
        get(products => {
            if (this.id) {
                Product.findIndex(this.id, (index) => {
                    products[index] = this;
                    fs.writeFile(p, JSON.stringify(products), err => {
                        console.log(err);
                        if (!err) {
                            cb();
                        }
                    })

                })
            } else {
                this.id = Math.random();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    if (!err) cb()
                    else console.log(err);
                })
            }

        })
    }

    static fetchAll(cb) {
        get(products => {
            cb(products);
        })
    }

    static getProduct(id, cb) {
        get(products => {
            const product = products.find(el => el.id === +id);
            cb(product);
        })
    }

    static findIndex(id, cb) {
        get(products => {
            const index = products.findIndex(el => el.id === +id);
            console.log(index);
            cb(index);
        })
    }

    static deleleProduct(id, cb) {
        get(products => {
            const product = {
                ...products.find(el => el.id === +id)
            };
            console.log(id);
            products = products.filter(el => el.id !== +id);

            fs.writeFile(p, JSON.stringify(products), err => {
                if (!err) {
                    Cart.deleleFromCart(id, product.price, cb)
                }
            })
        })
    }


}