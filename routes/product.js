const express = require("express");
const productController = require("../controller/product");
const { isAuth, isAdmin } = require("../middlewares/auth");

const productRoute = express.Router();

productRoute.get("/seed", productController.addToDbFromFile); //put this before getproductbyid route otherwise "seed" will be considered as :id and getproductbyid will be called instead
productRoute.get("/", productController.getProducts);
productRoute.get(
  "/adminProducts",
  isAuth,
  isAdmin,
  productController.getAdminProducts
);
productRoute.get('/search', productController.searchProducts);
productRoute.get("/:id", productController.getProductById);
productRoute.put("/:id", isAuth, isAdmin, productController.updateProduct);
productRoute.post("/create", isAuth, isAdmin, productController.createProduct);
productRoute.delete("/:id", isAuth, isAdmin, productController.deleteProduct);
module.exports = productRoute;
