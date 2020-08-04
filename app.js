const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const csurf = require("csurf");
const rootDir = require("./util/path");
const path = require("path");
const app = express();
const session = require("express-session");
const mongoSessionStore = require("connect-mongodb-session")(session);
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controller/error");
const authRoutes = require("./routes/auth");
const connectFlash = require("connect-flash");
const User = require("./models/user");
const csrf = csurf();
const multer = require("multer");

app.set("view engine", "ejs");

app.set("views", "views");

const store = new mongoSessionStore({
    uri: "mongodb://shop:shop1234@ds139781.mlab.com:39781/node-shop",
    collection: "session",
});

const fileStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, "images");
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimeType === "image/png" ||
        file.mimeType === "image/jpg" ||
        file.mimeType === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);

app.use(
    multer({
        storage: fileStorage,
    }).single("image")
);

app.use(express.static(path.join(rootDir, "public")));
app.use("/images", express.static(path.join(rootDir, "images")));
app.use(
    session({
        secret: "hello everyone what the duck is this",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(csrf);
app.use(connectFlash());

app.use((req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user._id)
            .then((user) => {
                if (!user) {
                    return next();
                }
                req.user = user;
                next();
            })
            .catch((err) => {
                const error = new Error(err);
                error.statusCode = 500;
                next(error);
            });
    } else next();
});

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render("500", {
        pageTitle: "Error",
        path: "/500",
        isLoggedIn: req.session.isLoggedIn || false,
    });
});

mongoose
    .connect("mongodb://shop:shop1234@ds139781.mlab.com:39781/node-shop")
    .then((res) => {
        app.listen(process.env.PORT||3000);
        console.log("connected")
    })
    .catch((err) => {
        console.log(err);
    });