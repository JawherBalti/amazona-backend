const express = require('express')
const userController = require('../controller/user')
const { isAuth } = require('../middlewares/auth')
const userRoute = express.Router()

userRoute.post("/register", userController.register)
userRoute.post("/signin", userController.login)
userRoute.post("/activate", userController.activateAccount)
userRoute.put("/profile", isAuth, userController.updateUser)
userRoute.put("/profile/:id", isAuth, userController.adminUpdateUser)
userRoute.get("/getusers", isAuth, userController.getUsers)
userRoute.get("/:id", userController.getUser)
userRoute.delete("/:id", isAuth, userController.adminDeleteUser)

module.exports = userRoute