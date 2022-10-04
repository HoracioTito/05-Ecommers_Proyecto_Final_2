const express = require("express");

// Controllers
const {
    createUser,
    login,
    getAllProducstUser,
    updateUser,
    deleteUser,
    getAllOrdersUser,
    getOrderUser,
} = require("../controllers/users.controller");

// Middlewares
const { userExists } = require("../middlewares/users.middlewares");
const {
    protectSession,
    protectUsersAccount,
    protectAdmin,
} = require("../middlewares/auth.middlewares");
const {
    createUserValidators,
} = require("../middlewares/validators.middlewares");

const usersRouter = express.Router();
// a- Create User : username, email and password . OK
usersRouter.post("/", createUserValidators, createUser); //

// b- Login : email and password.  OK
usersRouter.post("/login", login);

/*******************************
 * Protecting below endpoints  *
 ******************************/

usersRouter.use(protectSession);

// c- Get All Products of User : id  of token . OK
usersRouter.get("/me", getAllProducstUser); // protectUsersAccount,

// d- Update User : username and email . OK
usersRouter.patch("/:id", userExists, protectUsersAccount, updateUser);

// e- Disable user.  OK
usersRouter.delete("/:id", userExists, protectUsersAccount, deleteUser);

// f: Get All Orders : status->purchased . 50%
usersRouter.get("/orders", getAllOrdersUser);

// G: Get Order  by Id  : status->purchased .  50%
usersRouter.get("/orders/:id", getOrderUser);

module.exports = { usersRouter };
