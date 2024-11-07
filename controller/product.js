const { Product } = require('../models/product')
const data = require('../data')
const { restart } = require('nodemon')

const addToDbFromFile = (req, res) => {
    Product.remove({})
        .then(() => {
            Product.insertMany(data.products)
                .then(product => res.send({ product }))
                .catch(err => res.status(400).json({ err }))
        })
        .catch(err => res.status(400).json({ err }))
}

const getProducts = (req, res) => {
    Product.find({})
        .then(product => res.send(product))
        .catch(err => res.send(err))
}

const getProductById = (req, res) => {
    Product.findById(req.params.id)
        .then(product => res.send(product))
        .catch(err => res.status(404).send({ message: "Product not found!" }))
}


module.exports = { addToDbFromFile, getProducts, getProductById }