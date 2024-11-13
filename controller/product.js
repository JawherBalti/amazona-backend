const { Product } = require("../models/product");
const data = require("../data");

const PAGE_SIZE = 9;

const addToDbFromFile = (req, res) => {
  Product.remove({})
    .then(() => {
      Product.insertMany(data.products)
        .then((product) => res.send({ product }))
        .catch((err) => res.status(400).json({ err }));
    })
    .catch((err) => res.status(400).json({ err }));
};

const getProducts = (req, res) => {
  Product.find({})
    .then((product) => res.send(product))
    .catch((err) => res.send(err));
};

const getProductById = (req, res) => {
  Product.findById(req.params.id)
    .then((product) => res.send(product))
    .catch((err) => res.status(404).send({ message: "Product not found!" }));
};

const createProduct = async (req, res) => {
  const { name, price, image, category, brand, countInStock, description } =
    req.body;
  const product = new Product({
    name,
    price,
    image,
    category,
    brand,
    countInStock,
    description,
    rating: 0,
    numReviews: 0,
  });

  product
    .save()
    .then(() => res.send({ message: "Product Updated" }))
    .catch((err) => {
      res.status(400).send(err);
    });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.image = req.body.image;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    await product.save();
    res.send({ message: "Product Updated" });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
};

const getAdminProducts = async (req, res) => {
  const { query } = req;
  const page = query.page || 1;
  const searchTerm = query.searchTerm;
  let pageSize = query.pageSize || PAGE_SIZE;
  const sortField = query.sortBy || 'name';
  const sortOrder = query.order === 'desc' ? -1 : 1;

  let queryOptions = {};
  let skip = pageSize * (page - 1);

  if (searchTerm) {
    try {
      // Check if searchTerm looks like a MongoDB ObjectId
      
      if (/^[a-f\d]{24}$/i.test(searchTerm)) {
        queryOptions._id = searchTerm;        
        skip = 0;
        pageSize = 1;

      } else {
        queryOptions.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
        ];
      }
    } catch (err) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }
  }

  const sortOptions = {};
  sortOptions[sortField] = sortOrder;

  const products = await Product.find(queryOptions)
    .skip(skip)
    .limit(pageSize)
    .sort(sortOptions);

  const countProducts = await Product.countDocuments(queryOptions);

  res.send({
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / pageSize),
    sortBy: sortField,
    order: sortOrder === -1 ? 'desc' : 'asc'
  });
};


const searchProducts = async (req, res) => {
  const { searchTerm } = req.query;
  const page = query.page || 1;
  const pageSize = query.pageSize || PAGE_SIZE;
  let queryOptions = {};
  const skip = pageSize * (page - 1);


  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  if (searchTerm) {
    queryOptions.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { slug: { $regex: searchTerm, $options: 'i' } }
    ];
  }


  try {
    // Search by ID
    let productById = null;
    if (/^[a-f\d]{24}$/i.test(searchTerm)) {
      productById = await Product.findById(searchTerm);
    }

    // Search by name
    const productsByName = await Product.find(queryOptions)
    .skip(skip)
    .limit(pageSize);

    const countProducts = await Product.countDocuments(queryOptions);


    res.json({
      productById,
      productsByName,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error searching products', error: err.message });
  }
};


module.exports = {
  addToDbFromFile,
  getProducts,
  getProductById,
  updateProduct,
  getAdminProducts,
  createProduct,
  deleteProduct,
  searchProducts
};
