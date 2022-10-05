const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

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
const { storage } = require("../utils/firebase.util");

/***************************
 *  Upload Image FireBase  *
 **************************/
const {
    uploadProductsImgs,
    getProductsImgsUrls,
} = require("../utils/firebase.util");
const { ProductImg } = require("../models/productsImgs.model");

dotenv.config({ path: "./config.env" });

// Gen random jwt signs
// require('crypto').randomBytes(64).toString('hex') -> Enter into the node console and paste the command

// a ) Get Products with status active
const getAllProducts = catchAsync(async (req, res, next) => {
    // Validate if the user exist with given email
    const products = await Product.findAll({
        where: { status: "active" },
        include: [
            {
                model: ProductImg,
            },
        ],
    });
    console.log(products);

    // return res.status(200).json({
    //     status: "success",
    //     data: { products },
    // });

    /****************************
     * Firebase : get url image  *
     ***************************/
    // Loop through posts to get to the productsImgs
    const postsWithImgsPromises = products.map(async (product) => {
        //Get imgs URLs
        const postImgsPromises = product.productsImgs.map(
            async (productImg) => {
                const imgRef = ref(storage, productImg.imgUrl);
                const imgUrl = await getDownloadURL(imgRef);
                productImg.imgUrl = imgUrl;
                return productImg;
            }
        );
        // Resolve imgs urls
        const productsImgs = await Promise.all(postImgsPromises);
        // Update old productsImgs array with new array
        product.productsImgs = productsImgs;
        return product;
    });

    const postsWithImgs = await Promise.all(postsWithImgsPromises);

    res.status(200).json({
        status: "success",
        data: { products: postsWithImgs },
    });
});

// b ) Get Product by id
const getProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Validate if the user exist with given email
    const product = await Product.findOne({ where: { id, status: "active" } });

    // If user doesn't exist, send error message
    if (!product) {
        return res.status(404).json({
            status: "error",
            message: "Product not found",
        });
    }

    res.status(200).json({
        status: "success",
        data: { product },
    });
});

// c ) Get Categories with status active
const getAllCategories = catchAsync(async (req, res, next) => {
    // Catgory with status active
    const categories = await Category.findAll({
        where: { status: "active" },
    });

    res.status(200).json({
        status: "success",
        data: { categories },
    });
});

// d ) Create Product  : title, description, price (INT),categoryId y quantity
const createProduct = catchAsync(async (req, res, next) => {
    const { title, description, price, categoryId, quantity } = req.body;
    const { sessionUser } = req;

    // Create Product
    const newProduct = await Product.create({
        title,
        description,
        price,
        categoryId,
        quantity,
        userId: sessionUser.id,
    });

    /****************************
     * Firebase : upload image  *
     ***************************/
    await uploadProductsImgs(req.files, newProduct.id);

    // 201 -> Success and a resource has been created
    res.status(201).json({
        status: "success",
        data: { newProduct },
    });
});

// h- Update Product :  title, description,  price, quantity .
const updateProduct = catchAsync(async (req, res, next) => {
    const { title, description, price, quantity } = req.body;
    const { id } = req.params;
    const { sessionUser } = req;

    // Method 1: Update by using the model
    // await User.update({ name }, { where: { id } });

    // Method 2: Update using a model's instance
    const product = await Product.update(
        { title, description, price, quantity },
        { where: { id, userId: sessionUser.id } }
    );

    res.status(200).json({
        status: "success",
        data: { product },
    });
});

// e- Disabled Product.
const deleteProduct = catchAsync(async (req, res, next) => {
    const { product } = req;

    // Method 3: Soft delete
    await product.update({ status: "deleted" }, { where: { id: product.id } });
    res.status(204).json({ status: "success" });
});

// f-  Create Category : category. User logged . OK
const createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    // Create Product
    const newCategory = await Category.create({
        name,
    });

    // 201 -> Success and a resource has been created
    res.status(201).json({
        status: "success",
        data: { newCategory },
    });
});

// g- Update Category :  name and Address .  User logged
const updateCategory = catchAsync(async (req, res, next) => {
    const { category, sessionUser } = req;
    const { id } = req.params;
    const { name } = req.body;

    const categoryUpdated = await category.update(
        { name },
        { where: { id, userId: sessionUser.id } }
    );

    res.status(200).json({
        status: "success",
        data: { categoryUpdated },
    });
});

// h-  Delete category : reviews id - User Admin
const deleteCategory = catchAsync(async (req, res, next) => {
    const { category } = req;

    // Method 3: Soft delete
    await product.update({ status: "deleted" }, { where: { id: category.id } });
    res.status(204).json({ status: "success" });
});

module.exports = {
    getAllProducts,
    getProduct,
    getAllCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
};
