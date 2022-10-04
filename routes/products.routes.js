const express = require("express");
const { body, validationResult } = require("express-validator");

/* Controllers */

const {
    getAllProducts,
    getProduct,
    getAllCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/products.controller");

// Middlewares : ctrl exist id , etc
const {
    productExists,
    categoryNameExists,
    categoryExists,
    categoryIdExist,
} = require("../middlewares/products.middlewares");

/* Autentificacion   */
/* Autentificacion Protect  */
const {
    protectSession,
    protectUsersAccount,
    protectAdmin,
} = require("../middlewares/auth.middlewares");

/* Validators */
const {
    updateProductValidators,
    createProductValidators,
    categoryValidator,
} = require("../middlewares/validators.middlewares");

/****************************
 *   Utils Upload Image     *
 ***************************/
const { upload } = require("../utils/multer.util");

const productsRouter = express.Router();

// a- Get All Products : actives
productsRouter.get("/", getAllProducts); // OK

// c- Get All Categories : actives . OK
productsRouter.get("/categories", getAllCategories); // OK

// b- Get Product for id. OK
productsRouter.get("/:id", getProduct); // OK

/*******************************
 * Protecting below endpoints  *
 ******************************/
productsRouter.use(protectSession);

//TODO Funciona sin : categoryIdExist , createProductValidators
productsRouter.post("/", upload.array("postImg", 5), createProduct); //, categoryIdExist  , createProductValidators NOK

// e- Disabled Product.  User logged . OK
productsRouter.delete("/:id", productExists, deleteProduct);

// f-  Create Category : category. User logged . OK
productsRouter.post(
    "/categories",
    categoryValidator,
    categoryNameExists,
    createCategory
); // OK

// g- Update Category :  name and Address .  User logged . OK
productsRouter.patch(
    "/categories/:id",
    categoryValidator,
    categoryExists,
    updateCategory
); // OK

// h- Update Product :  title, description,  price, quantity .
productsRouter.patch(
    "/:id",
    productExists,
    updateProductValidators,
    updateProduct
); // OK

// Plus
// i-  Delete category : reviews id - User Admin , OK
//productsRouter.delete('/category/:id', categoryExists, deleteCategory); // NOK

module.exports = { productsRouter };
