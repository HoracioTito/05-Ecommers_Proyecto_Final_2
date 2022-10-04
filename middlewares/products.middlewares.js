// Models
const { Product } = require("../models/products.model");
const { Category } = require("../models/categories.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");

const productExists = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findOne({
        where: { id },
    });

    // If product doesn't exist, send error message
    if (!product) {
        return next(new AppError(`Product id ${id}  not found`, 404));
    }

    // req.anyPropName = 'anyValue'
    req.product = product;
    next();
});

const categoryNameExists = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    const category = await Category.findOne({
        where: { name },
    });

    // If category exist, send error message
    console.log(name);
    if (category) {
        return next(new AppError(`Category: "${name}" exists`, 200));
    }
    // req.anyPropName = 'anyValue'
    next();
});

const categoryExists = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findOne({
        where: { id },
    });

    // If category exist, send error message
    if (!category) {
        return next(new AppError(`Category id : ${id}  no exists `, 404));
    }
    // req.anyPropName = 'anyValue'
    req.category = category;
    next();
});

// Control if exists  foreignKey: "categoryId"
const categoryIdExist = catchAsync(async (req, res, next) => {
    const { categoryId } = req.body;

    const category = await Category.findOne({
        where: { id: categoryId },
    });

    // If category exist, send error message
    if (!category) {
        return next(
            new AppError(`Category id : ${categoryId}  no exists `, 404)
        );
    }
    // req.anyPropName = 'anyValue'
    req.category = category;
    next();
});

module.exports = {
    productExists,
    categoryNameExists,
    categoryExists,
    categoryIdExist,
};
