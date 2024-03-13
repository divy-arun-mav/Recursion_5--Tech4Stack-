const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    department:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    subject:{
        type: String,
        required: true,
    },
    user:{
        type: String,
        default: "Teacher",
    },
    email:{
        type: String,
        required: true,
    },
    teacherID:{
        type: Number,
        required: true,
    },
    phoneNo:{
        type: Number,
        required: true,
    },
    joiningDate:{
        type:Date,
        default:Date.now,
    }
});

teacherSchema.methods.generateToken = async function () {
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

const Teacher = mongoose.model("teacher", teacherSchema);
module.exports = Teacher;
