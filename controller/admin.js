const Product = require("../models/product");
const deleteFile = require("../util/deleteFile");
const { validationResult } = require("express-validator/check");
const ITEMS_PER_PAGE = 2;
exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        path: "/admin/add-product",
        pageTitle: "Add Product",
        edit: false,
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: "",
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = +req.body.price;
    const description = req.body.description;
    const imageUrl = req.file.path;
    console.log(imageUrl);  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            path: "/admin/add-product",
            pageTitle: "Add Product",
            edit: false,
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
        });
    }
    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user._id,
    });
    product
        .save()
        .then((result) => {
            console.log(result)
            res.redirect("/");
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const edit = req.query.edit;
    const id = req.params.id;
    Product.findById(id)
        .then((prod) => {
            res.render("admin/edit-product", {
                path: "/admin/edit-product",
                pageTitle: "Edit Product",
                edit: edit,
                product: prod,
                isLoggedIn: req.session.isLoggedIn,
                errorMessage: "",
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const description = req.body.description;
    const price = +req.body.price;

    console.log(req);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            path: "/admin/add-product",
            pageTitle: "Add Product",
            edit: false,
            isLoggedIn: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
        });
    }

    Product.findById(id)
        .then((prod) => {
            prod.title = title;
            prod.price = price;
            prod.description = description;
            if (req.file) {
                deleteFile(prod.imageUrl);
                prod.imageUrl = req.file.path;
            }
            return prod.save();
        })
        .then((r) => {
            console.log("updated");
            res.redirect("/");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let total = 0;
    Product.find({ userId: req.user._id })
        .countDocuments()
        .then((num) => {
            total = num;
            return Product.find({ userId: req.user._id })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((prod) => {
            res.render("admin/products", {
                products: prod,
                path: "/admin/products",
                pageTitle: "Admin Products",
                isLoggedIn: req.session.isLoggedIn,
                totalItems: total,
                hasNextPage: page * ITEMS_PER_PAGE < total,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                currentPage: page,
                lastPage: Math.ceil(total / ITEMS_PER_PAGE),
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.id;
    Product.findById(id)
        .then((product) => {
            deleteFile(product.imageUrl);
            return Product.findByIdAndRemove(id);
        })
        .then((resa) => {
            res.redirect("/admin/delete-product");
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

// const Product = require("../models/product");

// exports.getAddProduct = (req, res, next) => {
//     res.render("admin/edit-product", {
//         path: "/admin/add-product",
//         pageTitle: "Add Product",
//         edit: false,
//     });
// }

// exports.getEditProduct = (req, res, next) => {
//     const edit = req.query.edit;
//     const id = +req.params.id;
//     Product.getProduct(id).then(([prod]) => {

//         res.render("admin/edit-product", {
//             path: "/admin/edit-product",
//             pageTitle: "Edit Product",
//             edit: edit,
//             product: prod[0],
//         });
//     }).catch(err => {
//         console.log(err);
//     })

// }

// exports.postEditProduct = (req, res, next) => {
//     const id = +req.body.id;
//     const product = new Product(req.body.title, req.body.price, req.body.description, req.body.imageUrl, id);
//     product.save().then(resa => {
//         res.rediselrect("/");
//     }).catch(err => {
//         console.log(err);
//     });

// }

// exports.postAddProduct = (req, res, next) => {
//     const product = new Product(req.body.title, +req.body.price, req.body.description, req.body.imageUrl, null);
//     product.save().then(resa => {
//         res.redirect("/");
//     }).catch(err => {
//         console.log(err);
//     });

// };

// exports.getProducts = (req, res, next) => {

//     Product.fetchAll().then(([prod]) => {
//         res.render("admin/products", {
//             products: prod,
//             path: "/admin/products",
//             pageTitle: "Admin Products",
//         });
//     })
// }

// exports.postDeleteProduct = (req, res, next) => {
//     const id = +req.body.id;
//     Product.deleleProduct(id).then(resa => {
//         res.redirect("/");
//     }).catch(err => {
//         console.log(err);
//     })
// }
