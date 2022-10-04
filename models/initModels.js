// Models
const { User } = require("./user.model");
const { Order } = require("./orders.model");
const { Cart } = require("./carts.model");
const { Product } = require("./products.model");
const { Category } = require("./categories.model");
const { ProductImg } = require("./productsImgs.model");
const { ProductsInCart } = require("./productsInCart.model");


const initModels = () => {
    // 1 Users ----> M Orders
    User.hasMany(Order, { foreignKey: "userId" });
    Order.belongsTo(User);

    // 1 Carts -<---> 1 Orders
    Cart.hasOne(Order, { foreignKey: "cartId" });
    Order.belongsTo(Cart);

    // 1 Users <----> 1 Carts
    User.hasOne(Cart, { foreignKey: "userId" });
    Cart.belongsTo(User);

    // 1 Carts <---> 1 ProductsInCart
    Cart.hasOne(ProductsInCart, { foreignKey: "cartId" });
    ProductsInCart.belongsTo(Cart);

    // 1 Users <----> M Products
    User.hasMany(Product, { foreignKey: "userId" });
    Product.belongsTo(User);

    // 1 Categories  <----> 1 Products
    Category.hasOne(Product, { foreignKey: "categoryId" });
    Product.belongsTo(Category);

    // 1 Products <----> M ProductsImgs
    Product.hasMany(ProductImg, { foreignKey: "productId" });
    ProductImg.belongsTo(Product);
    
    // 1 Products  <----> M productsInCart
    Product.hasOne(ProductsInCart, { foreignKey: "productId" });
    ProductsInCart.belongsTo(Product);

};

module.exports = { initModels };
