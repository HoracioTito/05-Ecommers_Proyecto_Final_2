const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Models
const { User } = require("../models/user.model");
const { Product } = require("../models/products.model");
const { Cart } = require("../models/carts.model");
const { Order } = require("../models/orders.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { Category } = require("../models/categories.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { productInCart } = require("../middlewares/carts.middlewares");

dotenv.config({ path: "./config.env" });

// Gen random jwt signs
// require('crypto').randomBytes(64).toString('hex') -> Enter into the node console and paste the command

// a- Add Product Cart : productId , quantity. Control Stock
const addProductCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, quantity } = req.body;

    // Is it Cart Active ?
    const cartActive = await Cart.findOne({
        where: { userId: sessionUser.id, status: "active" },
    });

    let varIdCart = 0;

    if (!cartActive) {
        // Create Cart
        const newCart = await Cart.create({
            userId: sessionUser.id,
        });

        varIdCart = newCart.id;
    } else {
        varIdCart = cartActive.id;
    }

    // Control quantity ( stock )
    const infoProduct = await Product.findOne({ where: { id: productId } });

    if (!infoProduct) {
        return res.status(404).json({
            status: "error",
            message: "Product not found ",
        });
    } else if (quantity > infoProduct.quantity) {
        return res.status(404).json({
            status: "error",
            message: `Quantity in stock:  ${infoProduct.quantity} `,
        });
    }

    // Is product exists in cart
    const existProduct = await ProductsInCart.findOne({
        where: { cartId: varIdCart, productId },
    });

    if (!existProduct) {
        // Add Product Cart
        const addProduct = await ProductsInCart.create({
            cartId: varIdCart,
            productId,
            quantity,
        });

        return res.status(200).json({
            status: "success",
            message: " Product add to cart ",
        });
    } else {
        // Control status
        const ctrlStatus = existProduct.status;

        if (ctrlStatus === "active") {
            // Return status product exists
            return res.status(400).json({
                status: "error",
                message: " Product exists in cart ",
            });
        } else if (ctrlStatus === "removed") {
            // Update product in cart ( status : removed )
            const updateProduct = await ProductsInCart.update(
                {
                    quantity,
                    status: "active",
                },
                {
                    where: { productId: productId, cartId: varIdCart },
                }
            );

            return res.status(200).json({
                status: "success",
                message: `Product added : ${infoProduct.title} ( update ) `,
            });
        }
    }
});

// b- Update Cart :  productId, newQty .
const updateCart = catchAsync(async (req, res, next) => {
    const { productId, newQty } = req.body;
    const { sessionUser } = req;
    const { productCart } = req;

    // Info product
    const infoProduct = await Product.findOne({ where: { id: productId } });

    if (!infoProduct) {
        return res.status(404).json({
            status: "error",
            message: "Product not found ",
        });
    } else if (newQty > infoProduct.quantity) {
        //*  Control quantity ( stock )
        return res.status(404).json({
            status: "error",
            message: `Quantity in stock:  ${infoProduct.quantity} `,
        });
    } else if (newQty === 0) {
        // Remove product is Qty=0
        const removeProduct = await ProductsInCart.update(
            { quantity: newQty, status: "removed" },
            { where: { cartId: productCart.cartId, productId } }
        );

        return res.status(200).json({
            status: "success",
            message: `Product actualized quantity : ${newQty} `,
            data: { removeProduct },
        });
    } else {
        //* Actualize product in cart
        const cartUpdate = await ProductsInCart.update(
            { quantity: newQty, status: "active" },
            { where: { cartId: productCart.cartId, productId: productId } }
        );

        res.status(200).json({
            status: "success",
            data: { cartUpdate },
        });
    }
});

// c - Remove product of cart.
const removeProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { productCart } = req;

    // Method 3: Soft delete
    await ProductsInCart.update(
        { quantity: 0, status: "removed" },
        { where: { cartId: productCart.cartId, productId: productId } }
    );
    res.status(200).json({ status: "success" });
});

// b ) Purchase cart
const purchaseCart = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const { cartInfo } = req;
    const { sessionUser } = req;

    let TotalCart = 0;

    //* Product in cart with status active

    const cartProduct = await Cart.findAll({
        attributes: ["id", "userId", "status"],
        where: { userId: sessionUser.id, status: "active" },

        include: [
            {
                model: ProductsInCart,
                where: { status: "active" },
                attributes: ["cartId", "productId", "quantity", "status"],
                include: [
                    {
                        model: Product,
                        attributes: ["title", "quantity", "price"],
                    },
                ],
            },
        ],
    });

    if (cartProduct.length === 0) {
        return next(new AppError("Cart empty", 404));
    }

    //* Total price

    // Map async -> Async operations with arrays
    const productPromises = cartProduct.map(async (product) => {
        // Calcule new stock
        const newStock =
            product.productsInCart?.product.quantity -
            product.productsInCart?.quantity;

        const cartItem = {
            cartId: product.id,
            userId: product.userId,
            productId: product.productsInCart.productId,
            stock: product.productsInCart?.product.quantity,
            price: product.productsInCart?.product.price,
            quantityInCart: product.productsInCart?.quantity,
            priceProductInCart:
                product.productsInCart?.product.price *
                product.productsInCart?.quantity,
            newStock: newStock,
        };

        //* Cacule total price
        TotalCart = TotalCart + cartItem.priceProductInCart;

        //* Product in cart purchase
        await ProductsInCart.update(
            {
                status: "purchased",
            },
            {
                where: {
                    cartId: cartItem.cartId,
                    productId: cartItem.productId,
                },
            }
        );

        //* Update new stock of product
        await Product.update(
            {
                quantity: cartItem.newStock,
            },
            {
                where: { id: cartItem.productId },
            }
        );

        // return cartItem; //only for test
    });

    //* Promise
    await Promise.all(productPromises);

    console.log(productPromises);

    //* Create order
    const purchase = await Order.create({
        userId: sessionUser.id,
        cartId: cartInfo.id,
        totalPrice: TotalCart,
    });

    //* Create order
    const cartSatus = await Cart.update(
        {
            status: "purchased",
        },
        {
            where: { id: cartInfo.id, userId: sessionUser.id },
        }
    );
    //! **************************************
    //! ** FALTA ENVIAR EL EMAIL A USUARIO  **
    //! **************************************

    res.status(200).json({
        status: "success",
        data: { TotalCart, cartProduct },
    });
});

const viewCart = catchAsync(async (req, res, next) => {
    const { cartInfo } = req;

    const productInCart = await ProductsInCart.findAll({
        where: { cartId: cartInfo.id },
    });

    // If category exist, send error message
    if (!productInCart) {
        return next(new AppError(`Cart id : ${cartInfo.id}  no exists `, 404));
    }

    res.status(200).json({
        status: "success",
        data: { productInCart },
    });
});

module.exports = {
    addProductCart,
    updateCart,
    removeProduct,
    purchaseCart,
    viewCart,
};
