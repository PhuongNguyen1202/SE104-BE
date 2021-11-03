'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox48a37214ab4c4cbab4dfad57cb451d9e.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

const User = require('../models/User')

//@route api/user/profile/
//@desc get user profile
//@access private
exports.getUserInfo = async(req, res) => {
    try{
        let profile = await User.findById(req.userID)
        return res.status(200).json({success: true, data: profile})

    } catch (err){
        res.status(500).json({success: false, message: error.message})
    }
}
//@route api/user/profile/update
//@desc update user profile
//@access private
// user bị khùng thì sao ?!?!
exports.updateUserInfo = async (req, res) => {
    try {
        const {firstname, lastname, gender} = req.body
        const user = await User.findByIdAndUpdate(req.userID ,{
            firstname,
            lastname,
            gender

        })
        let profile = await User.findById(req.userID)
        res.status(200).json({success: true, data: profile})

    } catch (error) {
        res.status(409).json({success: false, message: error.message })
    }
}
//@route api/user/profile/changepassword
//@desc update user password
//@access private
exports.updatePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body
        if(!oldPassword || !newPassword){
            return res.status(400).json({success: false, message: "Missing field"})
        }
        if(oldPassword === newPassword){
            return res.status(422).json({success:false, message: "Newpassword must be not same oldpassword" })
        }
        const user = await User.findById(req.userID)
        if (user) {
            const passwordValid = await bcrypt.compareSync(oldPassword, user.password)

            if (!passwordValid) return res.status(422).json({success: false, message: "Password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const userPassword = await User.findByIdAndUpdate(req.userID, {
            password: hashedPassword
        });
        return res.status(200).json({success: true, data: userPassword })

    } catch (error) {
        res.status(409).json({success: false, message: error.message })
    }
}

//@route api/user/forgot-password
//@desc post email
//@access public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({success: false, message: "Missing field"})
        }
        const user = await User.findOne({ email })
        if (!user) return res.status(422).json({ success: false, message: "Email not found!" });
        //If email is correct
        const token = jwt.sign(
            { _id: user._id },
            process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'})

        const data = {
            from: 'noreply@hello.com',
            to: email,
            subject: 'Reset Password Link',
            html: `
                        <h2>Nhấn vào link sau đây để reset password</h2>
                        <p>${process.env.CLIENT_URL}/resetpassword/${token}`
        };

        const userupdate = await User.findByIdAndUpdate(user._id, { resetLink: token }, { new: true });
        await mg.messages().send(data, function (error, body) {
            if (error) {
                res.status(422).json({success: false, message: error.message })
            }
            else res.status(200).json({success: true, result: userupdate})
        });
    } catch (error) {
        res.status(404).json({success:false, message: error.message })
    }
};

//@route api/user/reset-password
//@desc post password
//@access private

exports.resetPassword = async (req, res) => {
    try{
        const resetLink = req.params.token 
        const {newPass} = req.body
        if(!newPass){
            return res.status(400).json({success: false, message: 'Missing field'})
        }
       
        if(resetLink){
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, async (err, decodedData) =>{
                if(err){
                    return res.status(401).json({success: false, message: err.message})
                }

                User.findOne({resetLink}, async (err,user) =>{
                    if(err || !user){
                        return res.status(400).json({success: false, message: 'User with this token does not exist.'})
                    }

                    const passwordValid = await bcrypt.compareSync(newPass, user.password)

                    if (passwordValid) return res.status(422).json({success: false, message: "Your new password is the same old password" });

                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(newPass, salt)
                    const obj = {
                        password: hashPassword,
                        resetLink: ''
                    }

                    user = _.extend(user, obj)
                    user.save((err, result) =>{
                        if (err) {
                            res.status(401).json({success: false, message: error.message })
                        }
                        else res.status(200).json({success: true, message: 'Reset Password successfully'})
                    })
                })
            })
        }
        else{
           return res.status(401).json({success: false, message: 'Authentication error'})
        }
    }
    catch(err){
        return res.status(500).json({success: false, message: err.message})
    }
}

