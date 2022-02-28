const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const auth = require("../../middleware/auth");
const Device = require('../../models/device');
const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER;
// Load input validation
const validateLoginInput = require("../../validation/login"); 
// Load User model
const User = require("../../models/user");
const jwtsign = (payload)=>{
  // Sign token
  return jwt.sign(
    payload,
    keys.secretOrKey,
    {
      expiresIn: 31556926 // 1 year in seconds
    }
  );
}
router.post("/login",  (req, res) => { 
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  const phoneNumber = req.body.phoneNumber;
  // Find user by email
  User.findOne({ phoneNumber }).then(user => {
    // Check if user exists
    if (!user) { 
      return res.json({code:'404', error:"not found", message: "phoneNumber not found"});
    }
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber
    };
    const token = jwtsign(payload); 
    return res.status(200).json({token, user:{
      phoneNumber:user.phoneNumber,
      role:user.role,
      status:user.status,
    }})
  });
  
});

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
          phoneNumber:req.body.phoneNumber,
          role: (ADMIN_PHONE_NUMBER == req.body.phoneNumber ? "admin":"user"),
        });
        newUser
          .save()
          .then(user => {
            const payload = {id:user._id, phoneNumber:user.phoneNumber};
            const token = jwtsign(payload);

            const device = new Device({
              phoneNumber:user.phoneNumber,

            })
            device.save().then(device=>{
              res.status(200).json({
                token,
                success:true,
                user:{
                  phoneNumber:req.body.phoneNumber,
                  status:user.status,
                  role:user.role,
                }
              })
            });

          })
          .catch(err => console.log(err));
      }
    });
  });
router.get("/my-account",auth, async(req,res)=>{
  try {
    const user = req.user;
    res.status(200).json({
      user: {
        phoneNumber:user.phoneNumber,
        role:user.role,
        status:user.status,

      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});
  module.exports = router;
