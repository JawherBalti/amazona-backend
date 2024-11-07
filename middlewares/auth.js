const jwt = require('jsonwebtoken')

const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization    
    if(authorization){
        const token = authorization.slice(7, authorization.length) //Bearer xxxxxx
        jwt.verify(token, process.env.SECRET, (err, decode) => {
            if(err){
                res.status(401).send({message: "Session expired. Please login again!"})
            } else {
                req.user = decode
                next()
            }
        })
    } else {
        res.status(401).send({message: "There is no token"})
    }
}

const isAdmin = (req, res, next) => {
    console.log(req.user)
    if(req.user && req.user.isAdmin){
        next()
    } else{
        res.status(401).send({message: "Invalid admin token"})
    }
}

module.exports = { isAuth, isAdmin }