const express = require("express");
const orderController = require("../controller/order");
const { isAuth, isAdmin } = require("../middlewares/auth");

const orderRoute = express.Router();

orderRoute.post("/", isAuth, orderController.placeOrder);
orderRoute.get("/myorder", isAuth, orderController.myOrderList); //put this before getOrder route otherwise "myorder" will be considered as :id and getOrder will be called instead
orderRoute.get("/orders", isAuth, orderController.getOrders);
orderRoute.get("/summary", isAuth, isAdmin, orderController.getSummary);
orderRoute.get("/:id", orderController.getOrder);
orderRoute.put("/pay/:id", isAuth, orderController.updateOrder);
orderRoute.put("/deliver/:id", isAuth, orderController.deliverOrder);
orderRoute.delete("/:id", isAuth, orderController.deleteOrder);

module.exports = orderRoute;
