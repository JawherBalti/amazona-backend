const express = require("express");
const orderController = require("../controller/order");
const { isAuth, isAdmin } = require("../middlewares/auth");
const data = require('../data')
const usersData = require("../users")
const {faker} = require('@faker-js/faker');
const { Order } = require("../models/order");
const orderRoute = express.Router();

orderRoute.post("/", isAuth, orderController.placeOrder);
// orderRoute.get('/seed', async (req, res) => {
//     try {
//       const numOrders = 5
  
//         const orders = [];
  
//         for (let i = 0; i < numOrders; i++) {
//           const order = {
//             orderItems: [],
//             shippingAddress: {
//               name: usersData.users[Math.floor(Math.random() * usersData.users.length)].name,
//               address: `${Math.floor(Math.random() * 100) + 1} ${faker.location.street()}`,
//               city: faker.location.city(),
//               postalCode: faker.location.zipCode(),
//               country: faker.location.country()
//             },
//             paymentMethod: 'PayPal',
//             paymentResult: {
//               id: faker.finance.routingNumber(),
//               status: 'COMPLETED',
//               update_time: faker.date.recent(),
//               email_address: usersData.users[Math.floor(Math.random() * usersData.users.length)].email
//             },
//             itemsPrice: 0,
//             shippingPrice: parseFloat(faker.commerce.price()),
//             taxPrice: parseFloat(faker.commerce.price()),
//             totalPrice: 0,
//             user: usersData.users[Math.floor(Math.random() * usersData.users.length)]._id,
//             isPaid: Math.random() < 0.5 ? true : false,
//             paidAt: Math.random() < 0.5 ? faker.date.recent() : null,
//             isDelivered: Math.random() < 0.5 ? true : false,
//             deliveredAt: Math.random() < 0.5 ? faker.date.recent() : null
//           };
  
//           // Generate random products for the order
//           const numProducts = Math.floor(Math.random() * 5) + 1;
//           for (let j = 0; j < numProducts; j++) {
//             const product = data.products[Math.floor(Math.random() * data.products.length)];
//             console.log(product);
            
//             if (product.countInStock > 0) {
//               const qty = Math.min(Math.floor(Math.random() * 5) + 1, product.countInStock);
              
//               order.orderItems.push({
//                 name: product.name,
//                 qty: qty,
//                 image: product.image,
//                 price: product.price,
//                 product: product._id
//               });
              
//               order.itemsPrice += product.price * qty;
//             }
//           }
  
//           order.totalPrice = order.itemsPrice + order.shippingPrice + order.taxPrice;
          
//           orders.push(order);

//         }
//         await Order.insertMany(orders)
//         res.status(200).json({ message: 'Users seeded successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ 
//         success: false, 
//         error: 'Error generating orders',
//         message: error.message || 'Internal server error'
//       });
//     }
//   });
orderRoute.get("/myorder", isAuth, orderController.myOrderList); //put this before getOrder route otherwise "myorder" will be considered as :id and getOrder will be called instead
orderRoute.get("/orders", isAuth, orderController.getOrders);
orderRoute.get("/summary", isAuth, isAdmin, orderController.getSummary);
orderRoute.get("/:id", orderController.getOrder);
orderRoute.put("/pay/:id", isAuth, orderController.updateOrder);
orderRoute.put("/deliver/:id", isAuth, orderController.deliverOrder);
orderRoute.delete("/:id", isAuth, orderController.deleteOrder);

module.exports = orderRoute;
