const User = require('../models/user');
const bcrypt = require('bcrypt');
const {
    validationResult
} = require("express-validator/check");
exports.getLogin = (req, res, next) => {
    // const a = req.get("cookie");
    // let isLoggedIn;
    // if (a) {
    //     isLoggedIn = req.get("cookie").split("=")[1].trim() == "true";
    // }
    const [flashMessage] = req.flash("error")
    console.log(flashMessage)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: flashMessage ? flashMessage : "",
        preFill: false,
        errors: [],
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            preFill: true,
            data: {
                email,
                password,

            },
            errors: errors.array(),
        });
    }
    User.findOne({
        email: email
    }).then(user => {
        if (!user) {
            req.flash("error", "Email not found");
            return res.redirect("/login");
        }
        return bcrypt.compare(password, user.password).then(match => {
            if (match) {
                console.log(user);
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect("/");
                })
            }
            req.flash("error", "Password does not match")
            res.redirect("/login");
        })
    }).catch(err => {
        const error = new Error(err);
        error.statusCode = 500;
        next(error);
    })

};

exports.getLogout = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: "",
        preFill: false,
        errors: [],
    });
};

exports.postSignup = (req, res, next) => {
    console.log("renter")
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            preFill: true,
            data: {
                email,
                password,
                confirmPassword,
            },
            errors: errors.array(),
        });

    }

    bcrypt
        .hash(password, 12)
        .then((password) => {
            const user = new User({
                email: email,
                password: password,
                cart: []
            });
            return user.save();
        })
        .then((use) => {
            console.log(use);
            res.redirect('/login');
        }).catch(err => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });

};