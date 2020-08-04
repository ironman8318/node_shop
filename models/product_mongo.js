 const database = require("../util/database");
 const mongodb = require("mongodb");
 class Product {
     constructor(title, price, description, imageUrl, id, userId) {
         this.title = title;
         this.price = price;
         this.description = description;
         this.imageUrl = imageUrl;
         this._id = id ? new mongodb.ObjectId(id) : null;
         this.userId = new mongodb.ObjectId(userId);
     }

     save() {
         const db = database.getdb();
         if (this._id) {
             return db.collection("products").updateOne({
                 _id: new mongodb.ObjectId(this._id)
             }, {
                 $set: this
             });
         }
         return db.collection("products").insertOne(this).then(res => {
             return res;
         }).catch(err => {
             console.log(err);
         })

     }

     static fetchAll() {
         const db = database.getdb();
         return db.collection("products").find().toArray().then(res => {
             console.log(res);
             return res;
         }).catch(err => {
             console.log(err);
         })
     }

     static getProduct(id) {
         const db = database.getdb();
         return db.collection("products").find({
             _id: new mongodb.ObjectId(id)
         }).next().then(res => {
             return res;
         }).catch(err => {
             console.log(err);
         });
     }

     static deleteProduct(id) {
         const db = database.getdb();
         return db.collection("products").deleteOne({
             _id: new mongodb.ObjectId(id)
         })
     }


 }


 module.exports = Product;