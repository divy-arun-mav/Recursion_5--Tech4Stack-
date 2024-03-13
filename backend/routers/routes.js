const User = require('../model/User');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./firebase.json')
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const deviceToken = req.query.deviceToken;

    if (!email || !password) {
        return res.status(422).json({ error: "Please provide a valid email and password" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(422).json({ error: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const user = await User.findOne({ email });
            user.ntoken = deviceToken;
            await user.save();

            const secretKey = process.env.JWT_SECRET_KEY || 'YOURPRIVATEKEYHERE';
            const token = jwt.sign({ _id: user.id }, secretKey);

            return res.status(200).json({
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
});


router.post('/setToken/:mail', async (req, res) => {
    const { tokenName, thresholdValue } = req.body;
    const { email } = req.params;

    if (!tokenName) {
        return res.status(422).json({ error: "Please Provide tokenName" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(422).json({ error: "Invalid User" });
        }
        user.thresholdValue = thresholdValue;
        user.tokenName = tokenName;
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log('Please add all the fields');
        return res.status(422).json({ error: "Please add all the fields" });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });

        if (existingUser) {
            console.log('User already exists! with that username or email');
            return res.status(422).json({ error: "User already exists! with that username or email" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        // Generate and set the token before saving the user
        user.token = await user.generateToken();

        user.save().then(user => {
            return res.json({
                message: "Registered Successfully",
                token: user.token, // Use the token generated for the response
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
});



router.get('/user', authMiddleware, (req, res) => {
    try {
        const userData = req.User;
        console.log(userData);
        res.status(200).json({ msg: userData })
    } catch (error) {
        console.log(error)
    }
})


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
router.get('/sendNotification/:deviceToken/:title/:body', async (req, res) => {
    try {
        const deviceToken = req.params.deviceToken;
        const payload = {
            notification: {
                title: req.params.title,
                body: req.params.body
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

module.exports = router