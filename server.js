const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userRoute = require('./routes/user')
const orderRoute = require('./routes/order')
const productRoute = require('./routes/product')
const uploadRoute = require('./routes/upload')
const http = require('http')
const socketio = require('socket.io')
const cors = require("cors")

dotenv.config()

const app = express()

app.use(express.json())

app.use(cors({
    origin: ['https://amazona-client.vercel.app', 'http://localhost:3000'], // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.get('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})

app.use('/api/upload', uploadRoute);
app.use('/api/user', userRoute)
app.use('/api/order', orderRoute)
app.use('/api/products', productRoute)

const port = process.env.PORT || 5000
const db_uri = process.env.MONGO_URI

const httpServer = http.createServer(app)

// CORS middleware for Express
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://amazona-client.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

const io = socketio(httpServer, {
    cors: {
        origin: "https://amazona-client.vercel.app", // Specific frontend origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

const users = []

mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
mongoose.connection.once("open", () => {
    console.log("Connection to database established")
})


io.on("connection", (socket) => {
    console.log("connection", socket.id)

    socket.on('disconnect', () => {
        const user = users.find((x) => x.socketId === socket.id)
        if (user) {
            user.online = false
            console.log(user.name + ' is offline');
            const admin = users.find((x) => x.isAdmin && x.online)
            if (admin) {
                io.to(admin.socketId).emit('updateUser', user)
            }
        }
    })

    socket.on("onLogin", (user) => {
        const updatedUser = {
            ...user,
            online: true,
            socketId: socket.id,
            messages: []
        }
        const userExist = users.find(x => x._id === updatedUser._id)
        if (userExist) {
            userExist.socketId = socket.id
            userExist.online = true
        } else {
            users.push(updatedUser)
        }
        console.log(user.name + " is online")

        const admin = users.find(x => x.isAdmin && x.online)

        //if admin is already online, he will get the users as soon as they connect (in real time)
        if (admin) {
            io.to(admin.socketId).emit("updateUser", updatedUser)
        }
        //if an admin connects, he will get a list of all connected users
        if (updatedUser.isAdmin) {
            io.to(updatedUser.socketId).emit('listUsers', users)
        }
    })

    socket.on("onUserSelected", (user) => {
        const admin = users.find((x) => x.isAdmin && x.online)
        if (admin) {
            const userExist = users.find((x) => x._id === user._id)
            io.to(admin.socketId).emit('selectUser', userExist)
        }
    })

    socket.on("sendMessage", message => {
        if (message.isAdmin) {
            console.log(message);

            const user = users.find((x) => x._id === message._id && x.online);
            if (user) {
                io.to(user.socketId).emit('recieveMessage', message);
                user.messages.push(message);
            }
        } else {
            const admin = users.find((x) => x.isAdmin && x.online);
            if (admin) {
                io.to(admin.socketId).emit('recieveMessage', message);
                const user = users.find((x) => x._id === message._id && x.online);
                user.messages.push(message);
            } else {
                io.to(socket.id).emit('recieveMessage', { name: 'Admin', body: 'Sorry. I am not online right now'})
            }
        }
    })
})

httpServer.listen(port, () => console.log(`server is running on port ${port}`))
//app.listen(port, () => console.log(`server is running on port ${port}`))