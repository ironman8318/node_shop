exports.get404 = (req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: false,
        isLoggedIn: req.session.isLoggedIn,
    });
};