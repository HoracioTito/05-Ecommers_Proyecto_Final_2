const { body, validationResult } = require("express-validator");

// Utils
const { AppError } = require("../utils/appError.util");

const checkValidations = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // [{ ..., msg }] -> [msg, msg, ...] -> 'msg. msg. msg. msg'
        const errorMessages = errors.array().map((err) => err.msg);

        const message = errorMessages.join(". ");

        return next(new AppError(message, 400));
    }

    next();
};

const createUserValidators = [
    body("username")
        .isString()
        .withMessage("User name must be a string")
        .notEmpty()
        .withMessage("User name cannot be empty")
        .isLength({ min: 3 })
        .withMessage("User name must be at least 3 characters"),
    body("email").isEmail().withMessage("Must provide a valid email"),
    body("password")
        .isString()
        .withMessage("Password must be a string")
        .notEmpty()
        .withMessage("Password cannot be empty")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    checkValidations,
];

//? ****************************
//? *   Products Validator   *
//? ****************************

// title, description, price (INT),categoryId y quantity
const createProductValidators = [
    body("title")
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters"),
    body("description")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 5 })
        .withMessage("Description must be at least 5 characters"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("categoryId").isNumeric().withMessage("Category id must be a number"),
    body("quantity").isNumeric().withMessage("Quantity must be a number"),

    checkValidations,
];

const categoryValidator = [
    body("name")
        .isString()
        .withMessage("Name must be a string")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),
    checkValidations,
];

const updateProductValidators = [
    body("title")
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters"),
    body("description")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 5 })
        .withMessage("Description must be at least 5 characters"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    checkValidations,
];

//? ****************************
//? *   Carts Validator        *
//? ****************************

const addProductValidator = [
    body("productId").isNumeric().withMessage("Product id must be a number"),
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    checkValidations,
];

module.exports = {
    createUserValidators,
    createProductValidators,
    categoryValidator,
    updateProductValidators,
    addProductValidator,
};
