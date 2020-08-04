const mongo = require("mongodb");
const client = mongo.MongoClient;
let _db = null;
exports.getConnection = (cb) => {
    client.connect("mongodb://localhost:27017").then(client => {
        console.log("database connected");
        _db = client.db();
        cb();
    }).catch(err => {
        console.log(err);
    })

}

exports.getdb = () => {
    if (_db) {
        return _db;
    } else {
        console.log("Not database found");
    }
}














// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     database: "node_shop",
//     password: "theavengers2"
// })


// module.exports = pool.promise();