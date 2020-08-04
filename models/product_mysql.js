const db = require("../util/database");
const Cart = require("./cart_fs");
const get = (cb) => {

}
module.exports = class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.id = id;
    }

    save() {
        if (this.id) {
            return db.execute(`update products set title="${this.title}",price="${this.price}",description="${this.description}",imageUrl="${this.imageUrl}" where products.id = ${this.id}`)
        } else {
            return db.execute(`insert into products(title,price,description,imageUrl) values(?,?,?,?)`, [this.title, this.price, this.description, this.imageUrl]);
        }
    }

    static fetchAll() {
        return db.execute("select * from products");
    }

    static getProduct(id) {
        return db.execute("select * from products where products.id = id");
    }

    static findIndex(id) {

    }

    static deleleProduct(id) {
        return db.execute("delete from products where products.id= id")
    }


}