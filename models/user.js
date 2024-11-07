const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

UserSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

UserSchema.methods.generateToken = function (cb) {
    var user = this;
    const token = jwt.sign(
        {
            _id: user._id,
        }, process.env.SECRET,
        {
            expiresIn: "7d" //token valid for 7 days
        }
    )
    cb(null, token);

}

const User = mongoose.model("User", UserSchema)
module.exports = { User }