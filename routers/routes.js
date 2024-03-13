const express = require('express');
const router = express.Router();
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const Classroom = require('../models/Classroom')
const authmiddleware = require('../middleware/authmiddleware')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase.json')


const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secureConnection: false,
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GPASSWORD,
    }
});

const sendMail = async (options) => {
    console.log("options:", options)
    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL,
            to: options.to,
            subject: options.title,//Title
            text: "Hello world?",
            html: `<b>${options.subject}</b>`,//Subject
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

router.post('/registerStudent', authmiddleware(Admin), async (req, res) => {
    const { fullname, department, password, email, phoneNo, sapID, subjects } = req.body;
    if (!email || !fullname || !password) {
        console.log('Please add all the fields');
        return res.status(422).json({ error: "Please add all the fields" });
    }

    try {
        const existingUser = await Student.findOne({ $or: [{ email: email }, { sapID: sapID }] });

        if (existingUser) {
            console.log('User already exists! with that username or email');
            return res.status(422).json({ error: "User already exists! with that username or email" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new Student({
            fullname,
            department,
            email,
            phoneNo,
            sapID,
            password: hashedPassword,
            subjects: subjects.map(subject => ({ name: subject })),
        });

        user.save().then(async user => {
            await sendMail({
                to: email,
                title: "Registration Successful!",
                subject: `Your Login ID is ${email} & Password is ${password}`
            });
            return res.json({
                message: "Registered Successfully",
                // token: await user.generateToken(),
                userId: user._id.toString(),
            });
        })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.post('/registerFaculty', authmiddleware(Admin), async (req, res) => {
    const { fullname, department, subject, password, email, phoneNo, teacherID } = req.body;

    if (!email || !fullname || !password) {
        console.log('Please add all the fields');
        return res.status(422).json({ error: "Please add all the fields" });
    }

    try {
        const existingUser = await Teacher.findOne({ $or: [{ email: email }, { teacherID: teacherID }] });

        if (existingUser) {
            console.log('User already exists! with that username or email');
            return res.status(422).json({ error: "User already exists! with that username or email" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new Teacher({
            fullname,
            department,
            subject,
            email,
            phoneNo,
            teacherID,
            password: hashedPassword
        });

        user.save().then(async user => {
            return res.json({
                message: "Registered Successfully",
                // token: await user.generateToken(),
                userId: user._id.toString(),
            });
        })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
            });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.post('/login/:USER', async (req, res) => {
    const { email, password } = req.body;
    const { USER } = req.params;
    const deviceToken = req.query.deviceToken;

    if (!email || !password) {
        return res.status(422).json({ error: "Please provide a valid email and password" });
    }

    try {
        let user;

        switch (USER.toLowerCase()) {
            case 'teacher':
                user = await Teacher.findOne({ email });
                break;
            case 'student':
                user = await Student.findOne({ email });
                if (!user) {
                    return res.status(422).json({ error: "Invalid username or password" });
                }
                user.tokens = deviceToken;
                await user.save();
                break;
            case 'admin':
                user = await Admin.findOne({ email });
                break;
            default:
                return res.status(400).json({ error: "Invalid USER parameter" });
        }

        if (!user) {
            return res.status(422).json({ error: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const secretKey = process.env.JWT_SECRET_KEY || 'yourDefaultSecretKey';
            const token = jwt.sign({ _id: user.id }, secretKey);

            return res.status(200).json({
                user: user,
                message: "Login successful",
                token,
            });
        } else {
            return res.status(404).json({ error: "Invalid Credentials!!!" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.get('/forgetPass/:email/:USER', async (req, res) => {
    const { USER, email } = req.params;
    console.log(USER);
    if (!email) {
        return res.status(422).json({ error: "Please provide a valid email" });
    }
    try {

        let user;
        switch (USER.toLowerCase()) {
            case 'teacher':
                user = await Teacher.findOne({ email });
                break;
            case 'student':
                user = await Student.findOne({ email });
                break;
            case 'admin':
                user = await Admin.findOne({ email });
                break;
            default:
                return res.status(400).json({ error: "Invalid USER parameter" });
        }
        if (!user) {
            return res.status(422).json({ error: "User Not Found" });
        }
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "10m",
            }
        );
        const id = user._id;
        try {
            await sendMail({
                to: user.email,
                title: "Password Reset Link",
                subject: `This Link Will Expire in 10 Minutes: <a href="http://localhost:3000/resetPassword/${USER}/${token}/${id}">Password Reset Link</a>`
            });
            res.status(200).json({ message: "Password Reset Link Is Sent On Your Email", link: token + id });
        }
        catch (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.put('/resetPassword/:USER/:token/:id', async (req, res) => {
    const { id, token, USER } = req.params;
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const verifyUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    let makeUpdate;
    if (verifyUser) {
        try {
            switch (USER.toLowerCase()) {
                case 'teacher':
                    makeUpdate = await Teacher.findByIdAndUpdate(id, { password: hashedPassword }, { useFindAndModify: false, new: true });
                    break;
                case 'student':
                    makeUpdate = await Student.findByIdAndUpdate(id, { password: hashedPassword }, { useFindAndModify: false, new: true });
                    break;
                case 'admin':
                    makeUpdate = await Admin.findByIdAndUpdate(id, { password: hashedPassword }, { useFindAndModify: false, new: true });
                    break;
                default:
                    return res.status(400).json({ error: "Invalid USER parameter" });
            }

            if (!makeUpdate) {
                return res.status(404).send("User Not Found");
            } else {
                return res.status(200).json({ message: "Password Changed Successfully!!!", user: makeUpdate });
            }
        } catch (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else {
        return res.status(404).json({ message: "Unauthorized User" });
    }
})



router.patch('/update_info/:id/:USER', async (req, res) => {
    const { id, USER } = req.params;
    const updateFields = req.body;
    try {
        if ('password' in updateFields) {
            const hashedPassword = await bcrypt.hash(updateFields.password, 10);
            updateFields.password = hashedPassword;
        }

        switch (USER.toLowerCase()) {
            case 'teacher':
                updatedUser = await Teacher.findOneAndUpdate(
                    { _id: id },
                    { $set: updateFields },
                    { useFindAndModify: false, new: true }
                );
                break;
            case 'student':
                updatedUser = await Student.findOneAndUpdate(
                    { _id: id },
                    { $set: updateFields },
                    { useFindAndModify: false, new: true }
                );
                break;
            case 'admin':
                updatedUser = await Admin.findOneAndUpdate(
                    { _id: id },
                    { $set: updateFields },
                    { useFindAndModify: false, new: true }
                );
                break;
            default:
                return res.status(400).json({ error: "Invalid USER parameter" });
        }

        if (!updatedUser) {
            return res.status(404).json({ error: "Failed To Update, User Not Found" });
        }

        return res.status(200).json({ "Updated_User_info": updatedUser });
    } catch (err) {
        return res.status(500).json({ "error": `Internal Server Error -> ${err}` });
    }
});


router.post('/markAttendance/:studentId', authmiddleware(Teacher), async (req, res) => {
    const { studentId } = req.params;
    const { subjectName } = req.body;

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ "error": "Student not found" });
        }

        const subject = student.subjects.find(subj => subj.name === subjectName);

        if (!subject) {
            return res.status(404).json({ "error": `Subject "${subjectName}" not found for the student` });
        }

        const today = new Date().toISOString().split('T')[0];

        const existingAttendanceRecord = subject.attendance.find(record => record.date.toISOString().split('T')[0] === today);

        if (existingAttendanceRecord) {
            return res.status(400).json({ "error": "Attendance already marked for today" });
        }

        subject.attendance.push({
            date: new Date(),
            count: subject.attendance.length + 1,
        });

        await student.save();

        return res.status(200).json({ "message": "Attendance marked successfully" });
    } catch (err) {
        return res.status(500).json({ "error": `Internal Server Error -> ${err}` });
    }
});


//Admin Updating Users Info (e.g) year if study
router.patch('/update_user_info/:id/:USER', authmiddleware(Admin), async (req, res) => {
    const { id, USER } = req.params;
    const updateFields = req.body;
    try {
        switch (USER.toLowerCase()) {
            case 'teacher':
                updatedUser = await Teacher.findOneAndUpdate(
                    { _id: id },
                    { $set: updateFields },
                    { useFindAndModify: false, new: true }
                );
                break;
            case 'student':
                updatedUser = await Student.findOneAndUpdate(
                    { _id: id },
                    { $set: updateFields },
                    { useFindAndModify: false, new: true }
                );
                break;
            default:
                return res.status(400).json({ error: "Invalid USER parameter" });
        }

        if (!updatedUser) {
            return res.status(404).json({ error: "Failed To Update, User Not Found" });
        }
        return res.status(200).json({ message: "User Updated Successfully!", Updated_User_info: updatedUser });
    } catch (err) {
        return res.status(500).json({ "error": `Internal Server Error -> ${err}` });
    }
});


router.get('/Student', authmiddleware(Student), (req, res) => {//done
    try {
        const userData = req.User;
        console.log(userData);
        res.status(200).json({ msg: userData })
    } catch (error) {
        console.log(error)
    }
})


router.get('/Admin', authmiddleware(Admin), (req, res) => {//done
    try {
        const userData = req.User;
        console.log(userData);
        res.status(200).json({ msg: userData })
    } catch (error) {
        console.log(error)
    }
})


router.get('/Teacher', authmiddleware(Teacher), (req, res) => {//done
    try {
        const userData = req.User;
        console.log(userData);
        res.status(200).json({ msg: userData })
    } catch (error) {
        console.log(error)
    }
})

router.get('/get_students', async (req, res) => {
    try {//done
        const data = await Student.find({});
        res.status(200).json({ msg: data })
    } catch (error) {
        console.log(error)
    }
})

router.get('/get_teachers', async (req, res) => {//done
    try {
        const data = await Teacher.find({});
        res.status(200).json({ msg: data })
    } catch (error) {
        console.log(error)
    }
})

router.get('/get_classrooms', authmiddleware(Admin || Teacher), async (req, res) => {
    try {
        const data = await Classroom.find({});
        res.status(200).json({ msg: data })
    } catch (error) {
        console.log(error)
    }
})

// router.patch('/update_class/:id', authmiddleware(Admin), async (req, res) => {
router.patch('/update_class/:id', authmiddleware(Admin), async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;
    try {
        const updatedClassroom = await Classroom.findOneAndUpdate(
            { _id: id },
            { $set: updateFields },
            { useFindAndModify: false, new: true }
        );

        if (!updatedClassroom) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        return res.status(200).json({ Updated_Classroom: updatedClassroom });
    } catch (err) {
        return res.status(500).json({ error: `Internal Server Error -> ${err}` });
    }
})



router.get('/class/:id', authmiddleware(Admin), async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Classroom.findById(id);
        res.status(200).json({ msg: data })
    } catch (error) {
        console.log(error)
    }
})


router.get('/find_class/:strength', authmiddleware(Teacher), async (req, res) => {
    try {
        const { strength } = req.params;

        if (isNaN(strength)) {
            return res.status(400).json({ error: "Strength parameter must be a valid number" });
        }

        const classrooms = await Classroom.find({
            isReserved: false,
            strength: { $gte: strength }
        }).select('classroom_no strength facility isReserved');


        if (classrooms.length === 0) {
            console.log("No classes found with isReserved set to false");
            return res.status(404).json({ error: "No classes found" });
        }

        console.log("Classes with isReserved set to false:", classrooms);
        res.status(200).json({ classrooms });
    } catch (e) {
        console.error("Error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
})


router.get('/studentAttendance/:studentId', async (req, res) => {
    const { studentId } = req.params;

    // Define 'today' as the current date in the format 'YYYY-MM-DD'
    const today = new Date().toISOString().split('T')[0];
    let totalAttendanceCount = 0;
    let totalPresentCount = 0;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ "error": "Student not found" });
        }

        const attendanceData = student.subjects.map(subject => {
            const presentDayAttendance = subject.attendance.filter(record => record.date.toISOString().split('T')[0] === today);
            totalAttendanceCount += subject.attendance.length;
            totalPresentCount += presentDayAttendance.length;

            return {
                name: subject.name,
                attendance: subject.attendance,
                dailyattendance: presentDayAttendance
            };
        });

        const totalAttendancePercentage = (totalPresentCount / totalAttendanceCount) * 100;

        return res.status(200).json({ "attendanceData": attendanceData, "totalAttendancePercentage": totalAttendancePercentage.toFixed(2) });
    } catch (err) {
        return res.status(500).json({ "error": `Internal Server Error -> ${err}` });
    }
});



router.get('/faculty/students/:department/:yearOfStudy', authmiddleware(['Teacher', 'Admin']), async (req, res) => {
    const { department, yearOfStudy } = req.params;

    try {
        const students = await Student.find({
            department: department,
            yearOfStudy: yearOfStudy
        });

        if (!students || students.length === 0) {
            return res.status(404).json({ "error": "No students found for the specified department and year" });
        }

        const studentList = students.map(student => ({
            _id: student._id,
            fullname: student.fullname,
            sapID: student.sapID,
        }));

        return res.status(200).json({ "studentList": studentList });
    } catch (err) {
        return res.status(500).json({ "error": `Internal Server Error -> ${err}` });
    }
});


router.post('/give_assignment/:yearOfStudy/:department', authmiddleware(Teacher), async (req, res) => {
    const { title, description, dueDate, subject } = req.body;
    const { yearOfStudy, department } = req.params;
    const teacherId = req.userID;

    try {
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const students = await Student.find({ yearOfStudy, department });

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for the specified yearOfStudy and department' });
        }

        const assignment = { title, description, dueDate, subject, createdBy: teacherId };

        for (const student of students) {
            // Ensure that the 'assignments' array is initialized
            if (!student.assignments) {
                student.assignments = [];
            }

            student.assignments.push(assignment);
            await student.save();
        }

        return res.status(200).json({ message: 'Assignment given successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//Working Code
router.get('/sendNotification', async (req, res) => {
    try {
        // const { department, yearOfStudy, data } = req.body;
        // const students = await Student.find({ department, yearOfStudy }, 'tokens');

        // const registrationTokens = students.flatMap(student => student.tokens);

        // if (!registrationTokens || registrationTokens.length === 0) {
        //     return res.status(400).send('No registration tokens found for the students');
        // }

        // const message = {
        //     data: {
        //         title: data.title,
        //         body: data.body,
        //     },
        //     tokens: registrationTokens,
        // };
        const serviceAccount = require('./firebase.json')
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });


        const deviceToken = 'fewnVqTezpg5lz-n1ImvYG:APA91bFLYknDYgl_D3uvGG-x3kLdLEYOKso2U3vXNTX-sUlSXux7a4NlQv4V3s-yodVq01i99ZIK0pwLTAChBXiYXUSXYjXcWbjESrrRYXnBQXzqMr7FHpieTDdOuBNm1F4xF-4eyYLO';


        const payload = {
            notification: {
                title: 'Test Notification',
                body: 'This is a test notification from your backend server.'
            }
        };


        admin.messaging().sendToDevice(deviceToken, payload)
            .then((response) => {
                console.log('Successfully sent test notification:', response);
            })
            .catch((error) => {
                console.error('Error sending test notification:', error);
            });

    } catch (error) {
        console.error('Error sending message1:', error);
        res.status(500).send('Error sending message');
    }
});



// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// router.post('/sendNotification', async (req, res) => {
//     try {
//         const { department, yearOfStudy, data } = req.body;
//         const students = await Student.find({ department, yearOfStudy }, 'tokens');

//         const registrationTokens = students.flatMap(student => student.tokens);

//         if (!registrationTokens || registrationTokens.length === 0) {
//             return res.status(400).send('No registration tokens found for the students');
//         }

//         const message = {
//             data: {
//                 title: data.title,
//                 body: data.body,
//             },
//             tokens: registrationTokens,
//         };

//         const messagingResponse = await admin.messaging(message);

//         console.log('Successfully sent notification:', messagingResponse);
//         res.status(200).json({ success: true, response: messagingResponse });

//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ success: false, error: 'Error sending message' });
//     }
// });

module.exports = router;