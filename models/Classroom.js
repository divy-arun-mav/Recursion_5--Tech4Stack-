const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
    classroom_no: {
        type: String,
        required: true,
    },
    faculty_name: {
        type: String,
        required: true
    },
    strength: {
        type: Number,
        required: true
    },
    facility: {
        type: String,
        required: true,
    },
    isReserved: {
        type: Boolean,
        default: false
    },
    isLab: {
        type: Boolean,
        default: false
    }
});

const Classroom = mongoose.model("classroom", classroomSchema);
module.exports = Classroom;