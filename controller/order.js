const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { User } = require("../models/user");

const PAGE_SIZE = 9;

const placeOrder = (req, res) => {
  if (req.body.orderItems.length === 0) {
    res.status(400).send({ message: "Cart is empty" });
  } else {
    const order = new Order({
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    order
      .save()
      .then((order) =>
        res.status(201).send({ message: "New Order Created", order })
      )
      .catch((err) => res.status(400).send({ message: "error" }));
  }
};

const myOrderList = async (req, res) => {
  const { query } = req;
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || PAGE_SIZE;
  const searchTerm = query.searchTerm;
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'desc' ? -1 : 1;

  const skip = pageSize * (page - 1);

  let filterQuery = { user: req.user._id }; // Always filter by the logged-in user's ID

  if (searchTerm && /^[a-f\d]{24}$/i.test(searchTerm)) {
    filterQuery._id = searchTerm;
  }

  if (!isNaN(searchTerm)) {
    filterQuery.totalPrice = { $gt: searchTerm };
  }

  try {
    const totalOrders = await Order.countDocuments(filterQuery);
    
    const orders = await Order.find(filterQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ [sortBy]: order });

    res.status(200).json({
      orders,
      page,
      pages: Math.ceil(totalOrders / pageSize),
      totalOrders,
      sortBy,
      order
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const getOrders = async (req, res) => {
  const page = Number(req.query.page) || 1;
  let pageSize = Number(req.query.pageSize) || PAGE_SIZE;
  const searchTerm = req.query.searchTerm || "";
  const sortField = req.query.sortBy || "totalPrice";
  const sortOrder = req.query.order === "desc" ? -1 : 1;

  let queryOptions = {};
  let skip = pageSize * (page - 1);

  if (searchTerm) {
    try {
      // Check if searchTerm looks like a MongoDB ObjectId

      if (/^[a-f\d]{24}$/i.test(searchTerm)) {
        queryOptions._id = searchTerm;
        skip = 0;
        pageSize = 1;
      } else if (!isNaN(searchTerm)) {
        // Search by `totalPrice` if `searchTerm` is numeric
        queryOptions.totalPrice = { $gt: Number(searchTerm) };
      } else {
        queryOptions.$or = [
          { "shippingAddress.name": { $regex: searchTerm, $options: "i" } },
        ];
      }
    } catch (err) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
  }

  const sortOptions = {};
  sortOptions[sortField] = sortOrder;

  // Count total users for pagination
  const totalOrders = await Order.countDocuments(queryOptions);

  // Fetch paginated, sorted, and filtered users
  const orders = await Order.find(queryOptions)
    .skip(skip)
    .limit(pageSize)
    .sort(sortOptions);

  res.status(200).json({
    orders,
    countOrders: totalOrders,
    page,
    pages: Math.ceil(totalOrders / pageSize),
    sortBy: sortField,
    order: sortOrder === -1 ? "desc" : "asc",
  });
};

const getOrder = (req, res) => {
  Order.findById(req.params.id)
    .then((order) => res.send(order))
    .catch((err) => res.status(404).send({ message: "Order not found!" }));
};

const updateOrder = (req, res) => {
  Order.findById(req.params.id)
    .then((order) => {
      console.log(1);

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        //paypal auto generated information
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      order
        .save()
        .then((order) => res.send({ message: "Order paid", order }))
        .catch((err) =>
          res.status(400).send({ message: "An error occured during payment!" })
        );
    })
    .catch((err) => res.status(404).send({ message: "Order not found!" }));
};

const deliverOrder = (req, res) => {
  Order.findById(req.params.id)
    .then((order) => {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order
        .save()
        .then((order) => res.send({ message: "Order delivered", order }))
        .catch((err) => res.status(400).send({ message: "An error occured!" }));
    })
    .catch((err) => res.status(404).send({ message: "Order not found!" }));
};

const deleteOrder = (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then((order) => res.send({ message: "Order deleted successfully!" }))
    .catch((err) =>
      res.status(400).send({ message: "Could not delete order!" })
    );
};

const getSummary = async (req, res) => {
  
}

module.exports = {
  placeOrder,
  getOrders,
  getOrder,
  updateOrder,
  myOrderList,
  deleteOrder,
  deliverOrder,
  getSummary,
};
