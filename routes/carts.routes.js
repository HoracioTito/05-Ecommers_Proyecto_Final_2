const express = require("express");
const { body, validationResult } = require("express-validator");

/* Controllers */
const {
    addProductCart,
    updateCart,
    removeProduct,
    purchaseCart,
    viewCart,
} = require("../controllers/carts.controller");

// Middlewares : ctrl exist id , etc
// Carts
const {
    productIdExists,
    productInCartExists,
    productInCart,
    cartExists,
    cartActiveExists,
} = require("../middlewares/carts.middlewares");

/* Autentificacion  */
const {
    protectSession,
    protectUsersAccount,
    protectAdmin,
} = require("../middlewares/auth.middlewares");

/* Validators */
const {
    addProductValidator,
} = require("../middlewares/validators.middlewares");

const cartsRouter = express.Router();

/*******************************
 * Protecting below endpoints  *
 ******************************/
cartsRouter.use(protectSession);

// a- Add Product Cart : productId , quantity. Control Stock
cartsRouter.post(
    "/add-product",
    addProductValidator,
    productIdExists,
    addProductCart
); // 50%

// b- Update Cart : productId, newQty ( in cart )
cartsRouter.patch("/update-cart", productInCartExists, updateCart); // OK

// c- Remove Product  : productId ( in cart change to status deleted )
cartsRouter.delete("/:productId", productInCart, removeProduct); // OK
// d- Purchase Cart  :  only prodcut active
cartsRouter.post("/purchase", cartExists, purchaseCart); // OK

// e- View Cart active  :  products in cart
cartsRouter.post("/cart", cartActiveExists, viewCart); // OK

module.exports = { cartsRouter };
