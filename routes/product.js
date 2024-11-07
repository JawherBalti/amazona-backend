const express = require('express')
const productController = require('../controller/product')

const productRoute = express.Router()

productRoute.get("/seed", productController.addToDbFromFile) //put this before getproductbyid route otherwise "seed" will be considered as :id and getproductbyid will be called instead
productRoute.get("/", productController.getProducts)
productRoute.get("/:id", productController.getProductById)

module.exports = productRoute