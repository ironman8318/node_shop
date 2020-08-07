const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const path = require("path");
const fs = require("fs");
const ITEMS_PER_PAGE = 4;
const pdfDocument = require("pdfkit");
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let total = 0;
    Product.find()
        .countDocuments()
        .then((num) => {
            total = num;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((prods) => {
            res.render("shop/index", {
                pageTitle: "All Products",
                path: "/products",
                products: prods,
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

exports.getIndex = (req, res, next) => {
    return res.redirect("https://nodeshop.azurewebsites.net/");
    const page = +req.query.page || 1;
    let total = 0;
    Product.find()
        .countDocuments()
        .then((num) => {
            total = num;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then((prods) => {
            res.render("shop/index", {
                pageTitle: "Index",
                path: "/",
                products: prods,
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

exports.postDeleteCart = (req, res, next) => {
    const id = req.body.id;
    req.user
        .deleteCart(id)
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.id;
    req.user
        .addToCart(prodId)
        .then((result) => {
            console.log(result.cart.items);
            res.redirect("/");
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then((prods) => {
        console.log(prods)
            res.render("shop/cart", {
                pageTitle: "Your Cart",
                path: "/cart",
                products: prods.cart.items,
                isLoggedIn: req.session.isLoggedIn,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        isLoggedIn: req.session.isLoggedIn,
    });
};

exports.getOrders = (req, res, next) => {
    Order.find({
            "user.userId": req.user._id,
        })
        .then((result) => {
            let fetchedOrders = result.map((el) => {
                return {
                    ...el._doc,
                };
            });
            console.log(fetchedOrders);
            res.render("shop/orders", {
                pageTitle: "Your Orders",
                path: "/orders",
                orders: fetchedOrders,
                isLoggedIn: req.session.isLoggedIn,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });

    // req.user.getOrder().then(orders => {

    //     res.render("shop/orders", {
    //         pageTitle: "Your Orders",
    //         path: "/orders",
    //         orders: orders,
    //     })

    // }).catch(err => {
    //     console.log(err);
    // })
};

exports.getProduct = (req, res, next) => {
    console.log("asdasdasdasdasd");
    const id = req.params.id;
    console.log(id);
    Product.findById(id)
        .then((prod) => {
            // console.log(prod);
            res.render("shop/product-detail", {
                pageTitle: prod.title,
                path: false,
                product: prod,
                isLoggedIn: req.session.isLoggedIn,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.statusCode = 500;
            next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .execPopulate()
        .then((prod) => {
            console.log(prod.cart.items);
            const products = prod.cart.items.map((el) => {
                return {
                    quantity: el.quantity,
                    product: {
                        ...el.productId._doc,
                    },
                };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user.id,
                },
                orders: products,
            });

            return order.save();
        })
        .then((result) => {
            req.user.cart = {
                items: [],
            };
            return req.user.save();
        })
        .then((r) => {
            res.redirect("/order");
        });
};

exports.getInvoice = (req, res, next) => {
    const id = req.params.id;
    const invoiceName = "invoice-" + id + ".pdf";
    Order.findOne({
            _id: id,
            "user.userId": req.user._id,
        })
        .then((order) => {
            const p = path.join(__dirname, "..", "data", invoiceName);
            const pdfDoc = new pdfDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                'inline;filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(p));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(24).text("INVOICE");
            pdfDoc.text("--------------------------------------");
            let totalPrice = 0;
            console.log(order);
            for (let el of order.orders) {
                totalPrice += el.product.price * el.quantity;
                pdfDoc
                    .fontSize(16)
                    .text(
                        `${el.product.title} =  ${el.product.price} X ${
                            el.quantity
                        } `
                    );
            }
            pdfDoc.text("--------------------------------------");
            pdfDoc.text(`TotalPrice = ${totalPrice}`);
            pdfDoc.end();

            // fs.readFile(p, (err, data) => {
            //     if (err) next(err);
            //     if (!err) {
            //         res.setHeader("Content-Type", "application/pdf");
            //         res.setHeader('Content-Disposition', 'attachment;filename=PA.pdf');
            //         res.send(data);
            //     }
            // })

            // const file = fs.createReadStream(p);
            // res.setHeader("Content-Type", "application/pdf");
            // res.setHeader('Content-Disposition', 'attachment;filename=PA.pdf');
            // file.pipe(res);
        })
        .catch((err) => {
            next(err);
        });
};

exports.getAbout = (req, res, next) => {
    res.render("shop/about", {
        pageTitle: "About",
        path: "/about",
        isLoggedIn: req.session.isLoggedIn,
    });
};

// const Product = require("../models/product");
// const Cart = require("../models/cart");

// exports.getProducts = (req, res, next) => {

//     Product.fetchAll()
//         .then(([prods]) => {
//             res.render("shop/index", {
//                 pageTitle: "All Products",
//                 path: "/products",
//                 products: prods,
//             })

//         }).catch(err => {
//             console.log(err);
//         })

// };

// exports.getIndex = (req, res, next) => {
//     Product.fetchAll()
//         .then(([prods]) => {
//             res.render("shop/index", {
//                 pageTitle: "Index",
//                 path: "/",
//                 products: prods,
//             })

//         }).catch(err => {
//             console.log(err);
//         })

// }

// exports.getCart = (req, res, next) => {
//     res.render("shop/cart", {
//         pageTitle: "Your Cart",
//         path: "/cart",
//     })
// }

// exports.postDeleteCart = (req, res, next) => {
//     const id = +req.body.id;
//     const price = +req.body.price;
//     Cart.deleleFromCart(id, price, () => {
//         res.redirect("/cart");
//     })
// }

// exports.postCart = (req, res, next) => {
//     const id = +req.body.id;
//     Product.getProduct(id, (product) => {
//         Cart.addToCart(id, product.price);
//     })
//     res.redirect("/cart");
// }

// exports.getCart = (req, res, next) => {
//     Cart.fetchAll((cart) => {
//         Product.fetchAll(products => {
//             let prods = [];
//             for (let prod of products) {
//                 let cartProd = cart.find(p => p.id === prod.id);
//                 if (cartProd) {
//                     prods.push({
//                         ...prod,
//                         qty: cartProd.qty
//                     });
//                 }
//             }
//             res.render("shop/cart", {
//                 pageTitle: "Your Cart",
//                 path: "/cart",
//                 products: prods,
//             })
//         })

//     })
// }

// exports.getCheckout = (req, res, next) => {
//     res.render("shop/checkout", {
//         pageTitle: "Checkout",
//         path: "/checkout",
//     })
// }

// exports.getOrders = (req, res, next) => {
//     res.render("shop/orders", {
//         pageTitle: "Your Orders",
//         path: "/orders",
//     })
// }

// exports.getProduct = (req, res, next) => {
//     const id = +req.params.id;
//     Product.getProduct(id).then(([prod]) => {
//         res.render("shop/product-detail", {
//             pageTitle: prod[0].title,
//             path: false,
//             product: prod[0],
//         })
//     })
//     Product.getProduct(id, (product) => {

//     })
// }
