const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {
    body
} = require("express-validator/check");
const authController = require("../controller/auth");


router.get("/login", authController.getLogin);

router.post("/login", [
    body("email").isEmail().withMessage("Enter a valid email Addresss").normalizeEmail(),
    body("password").isLength({
        min: 5
    }).withMessage("Password should be atleast 5 chracters long")
], authController.postLogin);

router.get("/signup", authController.getSignup);

router.post("/signup", [
    body("email").isEmail().withMessage("Enter a valid email Addresss").custom((value, {
        req
    }) => {
        return User.findOne({
            email: value
        }).then(user => {
            if (user) {
                return Promise.reject("Email already in use!")
            }
        })
    }).normalizeEmail(),
    body("password").isLength({
        min: 5
    }).withMessage("Password should be atleast 6 chracters long"),
    body("confirmPassword").custom((value, {
        req
    }) => {
        if (value !== req.body.password) {
            throw new Error("Password and confirm Password don't match");
        }
        return true;
    })
], authController.postSignup);

router.post("/logout", authController.getLogout);
module.exports = router;