const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Models
const { User } = require("../models/user.model");
const { Product } = require("../models/products.model");
const { Cart } = require("../models/carts.model");
const { Order } = require("../models/orders.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { ProductImg } = require("../models/productsImgs.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");

dotenv.config({ path: "./config.env" });

// Gen random jwt signs
// require('crypto').randomBytes(64).toString('hex') -> Enter into the node console and paste the command

// a ) OK
const createUser = catchAsync(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    if (role !== "admin" && role !== "normal") {
        return next(new AppError("Invalid role", 400));
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
    });

    // Remove password from response
    newUser.password = undefined;

    // 201 -> Success and a resource has been created
    res.status(201).json({
        status: "success",
        data: { newUser },
    });
});

// b ) OK
const login = catchAsync(async (req, res, next) => {
    // Get email and password from req.body
    const { email, password } = req.body;

    // Validate if the user exist with given email
    const user = await User.findOne({
        where: { email, status: "active" },
    });

    // Compare passwords (entered password vs db password)
    // If user doesn't exists or passwords doesn't match, send error
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError("Wrong credentials", 400));
    }

    // Remove password from response
    user.password = undefined;

    // Generate JWT (payload, secretOrPrivateKey, options)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    res.status(200).json({
        status: "success",
        data: { user, token },
    });
});

// c ) OK
const getAllProducstUser = catchAsync(async (req, res, next) => {
    // Get email and password from req.body
    const { sessionUser } = req;

    // Product created for user
    const productCreated = await Product.findAll({
        where: { userId: sessionUser.id },
    });

    res.status(200).json({
        status: "success",
        data: { productCreated },
    });
});

// d ) OK
const updateUser = catchAsync(async (req, res, next) => {
    const { username, email } = req.body;
    const { user } = req;

    await user.update({ username, email });

    res.status(200).json({
        status: "success",
        data: { user },
    });
});

// e ) OK
const deleteUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    await user.update({ status: "deleted" });

    res.status(204).json({ status: "success" });
});

// f ) OK
const getAllOrdersUser = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    // Select all Orders
    const orders = await Order.findAll({
        attributes: ["id", "userId", "cartId", "totalPrice"],
        where: { userId: sessionUser.id },
        include: [
            {
                model: Cart,
                attributes: ["id", "status"],
                include: [
                    {
                        model: ProductsInCart,
                        attributes: ["productId"],
                        where: { status: "purchased" },
                        include: [
                            {
                                model: Product,
                                attributes: ["title"],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    //* Orders no found
    if (orders.length === 0) {
        return res.status(404).json({
            status: "error",
            message: "Order not found ",
        });
    }

    res.status(200).json({
        status: "success",
        data: { orders: orders }, // order: orderCart,
    });
});

// g ) 50%
const getOrderUser = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { id } = req.params;

    const orders = await Order.findAll({
        attributes: ["id", "userId", "cartId", "totalPrice"],
        where: { id: id, userId: sessionUser.id },
        include: [
            {
                model: Cart,
                attributes: ["id", "status"],

                include: [
                    {
                        model: ProductsInCart,
                        attributes: ["cartId", "productId"],
                        where: { status: "purchased" },

                        include: [
                            {
                                model: Product,
                                attributes: ["id", "title"],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    if (orders.length === 0) {
        return res.status(404).json({
            status: "error",
            message: "Order id not found ",
        });
    }

    //* Product in order
    const productOrder = orders.map((order) => {
        const orderInfo = {
            idProduct: order.cart.productsInCart.product.id,
            title: order.cart.productsInCart.product.title,
        };
        return orderInfo;
    });

    //* Images of product
    const promiseImages = productOrder.map(async (orderImgs) => {
        const images = await ProductImg.findAll({
            attributes: ["productId", "imgUrl"],
            where: {
                productId: orderImgs.idProduct,
            },
        });
        return images;
    });

    //* Promise images
    const imagesProduct = await Promise.all(promiseImages);

    const orderCart = {
        order: orders[0].id,
        cart: orders[0].cartId,
        productOrder,
        imagesProduct,
    };

    res.status(200).json({
        status: "success",
        data: { orderCart },
    });
});

module.exports = {
    createUser,
    login,
    getAllProducstUser,
    updateUser,
    deleteUser,
    getAllOrdersUser,
    getOrderUser,
};
