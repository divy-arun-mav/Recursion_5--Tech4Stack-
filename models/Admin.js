const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    fullname: {
        type: String,
        default: "Admin Tiwari"
    },
    password: {
        type: String,
        // default:"Admin123"
        default: "$2a$12$Ss3ajoW7d/shXCUXCYJ/DOUp1j3Cr2r.K6BOed118CCPY1L5k0fQC"
    },
    user: {
        type: String,
        default: "Admin",
    },
    email: {
        type: String,
        default: "Admin123@gmail.com"
    },
    phoneNo: {
        type: Number,
        default: 9382714560
    }
});

adminSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.email,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "30d",
            }
        );
    } catch (error) {
        console.error("Token Error: ", error);
    }
};

const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
