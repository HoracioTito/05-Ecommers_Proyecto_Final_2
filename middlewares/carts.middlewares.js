// Models
const { Product } = require("../models/products.model");
const { Category } = require("../models/categories.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { ProductsInCart } = require("../models/productsInCart.model");
const { Cart } = require("../models/carts.model");

const productIdExists = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findOne({
        where: { id: productId, status: "active" },
    });

    // If product doesn't exist, send error message
    if (!product) {
        return next(
            new AppError(`Product id ${productId}  not found o deleted`, 404)
        );
    }

    // req.anyPropName = 'anyValue'
    req.product = product;
    next();
});

// Data for body
const productInCartExists = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    console.log("productInCartExists");
    const productCart = await ProductsInCart.findOne({
        where: { productId },
    });

    // If product doesn't exist, send error message
    if (!productCart) {
        return next(new AppError(`Product id ${productId}  not found`, 404));
    }
    // req.anyPropName = 'anyValue'
    req.productCart = productCart;
    next();
});

// Data for params
const productInCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    console.log("productInCart");
    const productCart = await ProductsInCart.findOne({
        where: { productId },
    });

    // If product doesn't exist, send error message
    if (!productCart) {
        return next(new AppError(`Product id ${productId}  not found`, 404));
    }
    // req.anyPropName = 'anyValue'
    req.productCart = productCart;
    next();
});

const cartExists = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const cartInfo = await Cart.findOne({
        where: { userId: sessionUser.id, status: "active" },
    });

    // If category exist, send error message

    if (!cartInfo) {
        return next(new AppError(`Cart no exists`, 404));
    }
    // req.anyPropName = 'anyValue'
    req.cartInfo = cartInfo;
    next();
});

const cartActiveExists = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const cartInfo = await Cart.findOne({
        where: { userId: sessionUser.id, status: "active" },
    });

    // If category exist, send error message

    if (!cartInfo) {
        return next(new AppError(`Cart active no exists`, 404));
    }
    // req.anyPropName = 'anyValue'
    req.cartInfo = cartInfo;
    next();
});

module.exports = {
    productInCartExists,
    productIdExists,
    productInCart,
    cartExists,
    cartActiveExists,
};
