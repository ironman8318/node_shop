const express = require("express");
const router = express.Router();
const shopController = require("../controller/shop");
const isAuth = require("../middleware/authCheck");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/delete-cart", isAuth, shopController.postDeleteCart);
// // router.get("/checkout", shopController.getCheckout);

router.get("/order", isAuth, shopController.getOrders);

router.get("/product/:id", shopController.getProduct);

router.post("/order", isAuth, shopController.postOrder);

router.get("/invoice/:id", isAuth, shopController.getInvoice);

router.get("/about", shopController.getAbout);
module.exports = router;
