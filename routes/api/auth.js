const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const auth = require("../../middleware/auth");
const Device = require('../../models/device');
const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER;
const otpGenerator = require('otp-generator');
// Load input validation
const validateLoginInput = require("../../validation/login");
const { sendOtp } = require("../../utils/channel");
// Load User model
const User = require("../../models/user");
const { sendMsg } = require("../../config/socket");
const otps = [];
const jwtsign = (payload) => {
    // Sign token
    return jwt.sign(
        payload,
        keys.secretOrKey, {
            expiresIn: 31556926 // 1 year in seconds
        }
    );
}
router.post("/login", (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
        return res.status(200).json({ success: false, errors });
    }
    const phoneNumber = req.body.phoneNumber;

    // Find user by email
    User.findOne({ phoneNumber }).then(async(user) => {
        try {
            // Check if user exists
            if (!user) {
                otps[phoneNumber] = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
                // opt send
                const result = await sendOtp(phoneNumber, otps[phoneNumber]);

                if (result != null)
                    return res.json({ code: '200', error: "not found", message: "sent opt code" });
                else {
                    return res.json({ code: '404', error: "not found", message: "not sent opt code, try again" });
                }
            }
            const payload = {
                id: user._id,
                phoneNumber: user.phoneNumber
            };
            const token = jwtsign(payload);
            const device = await Device.findOne({ phoneNumber: user.phoneNumber });
            return res.status(200).json({
                token,
                user: {
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    status: user.status,
                    device: ((device != null && device.deviceNumber != "") ? device : null)
                }
            })

        } catch (e) {
            console.log(e); // caught
        }

    });

});
router.post("/verifyOtp", (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        if (otps[phoneNumber] && `${otps[phoneNumber]}` == otp) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(200).json({ success: false, err: "wrong otp" });
        }
    } catch (err) {
        return res.status(200).json({ success: false, err });
    }

})
router.post("/register", (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({ phoneNumber: req.body.phoneNumber }).then(user => {
        if (user) {
            return res.json({ phoneNumber: "phoneNumber already exists", status: 501 });
        } else {
            const newUser = new User({
                phoneNumber: req.body.phoneNumber,
                role: (ADMIN_PHONE_NUMBER == req.body.phoneNumber ? "admin" : "user"),
            });
            newUser
                .save()
                .then(user => {
                    const payload = { id: user._id, phoneNumber: user.phoneNumber };
                    const token = jwtsign(payload);
                    const device = new Device({
                        phoneNumber: user.phoneNumber,
                    })
                    device.save().then(result => {
                        res.status(200).json({
                            token,
                            success: true,
                            user: {
                                phoneNumber: req.body.phoneNumber,
                                status: user.status,
                                role: user.role,
                                device: null,
                            }
                        })
                    });

                })
                .catch(err => {
                    console.log(err);
                    res.status(200).json({
                        success: false,
                        err: err
                    })
                });
        }
    });
});
router.get("/my-account", auth, async(req, res) => {
    try {
        const user = req.user;
        const device = await Device.findOne({ phoneNumber: user.phoneNumber });
        res.status(200).json({
            user: {
                phoneNumber: user.phoneNumber,
                role: user.role,
                status: user.status,
                device: ((device != null && device.deviceNumber != "") ? device : null)
            }
        });
    } catch (error) {
        res.status(200).json({
            success: false,
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
module.exports = router;