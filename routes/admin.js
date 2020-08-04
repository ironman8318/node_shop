const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const isAuth = require("../middleware/authCheck");
const {
    body
} = require("express-validator/check");

router.get("/add-product", isAuth, adminController.getAddProduct)

router.post("/add-product", [body("title").isString().isLength({
            min: 1
        }).withMessage("Title should have atleast one Charactertrim").trim(),
        body("price").isFloat().withMessage("Price needs to be number"),
        body("description").isLength({
            min: 5,
            max: 200
        }).withMessage("Description should be atleast 5 to 200 characters long")

    ],
    isAuth, adminController.postAddProduct)

router.post("/edit-product", [body("title").isString().isLength({
            min: 1
        }).withMessage("Title should have atleast one Character").trim(),
        body("price").isFloat().withMessage("Price needs to be number"),
        body("description").isLength({
            min: 5,
            max: 200
        }).withMessage("Description should be atleast 5 to 200 characters long")

    ],
    isAuth, adminController.postEditProduct)

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:id", isAuth, adminController.getEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;