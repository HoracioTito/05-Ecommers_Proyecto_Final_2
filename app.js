const express = require("express");
const helmet = require("helmet");
const compresion = require("compression");
const morgan = require("morgan");

// Routers
const { usersRouter } = require("./routes/users.routes");
const { productsRouter } = require("./routes/products.routes");
const { cartsRouter } = require("./routes/carts.routes");

// Controllers
const { globalErrorHandler } = require("./controllers/error.controller");

// Init our Express app
const app = express();

// Enable Express app to receive JSON data
app.use(express.json());

// Heroku : Add Security
app.use(helmet());

//  Heroku :  Comapresion
app.use(compresion());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
else if (process.env.NODE_ENV === "production") app.use(morgan("combined"));

// Define endpoints
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartsRouter);

// Global error handler
app.use(globalErrorHandler);

// Catch non-existing endpoints
app.all("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: `${req.method} ${req.url} does not exists in our server`,
    });
});

module.exports = { app };
