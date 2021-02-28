module.exports = {
    NotFoundMiddleware: require("./not-found.middleware"),
    ErrorMiddleware: require("./error.middleware"),
    AuthMiddleware: require("./auth.middleware"),
    GuestMiddleware: require('./guest.middleware'),
    ProductValidatorMiddleware: require('./product-validator.middleware'),
    AdminMiddleware: require("./admin-middleware")
};