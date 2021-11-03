'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox48a37214ab4c4cbab4dfad57cb451d9e.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

const User = require('../models/User')

//@route api/auth/register
//@desc post registerform
//@access public

exports.registerUser = async(req, res) => {
    const {firstname, lastname, email, password, gender} = req.body
    if(!firstname || !lastname || !email || !password){
        return res.status(400).json({success: false, message: 'Missing field'})
    }

    try{
        const user_email = await User.findOne({email})

        if(user_email){
            return res.status('400').json({success: false, message: 'Email exist'})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let temp = firstname.slice(0,1);
        const avatar = 'http://localhost:5000/avatar/default/' +`${temp}.jpg` 

        const newUser = new User({email, firstname, lastname, password: hashedPassword, gender, avatar})
        await newUser.save()

        const accessToken = jwt.sign({userID: newUser._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'User created successfully',
            accessToken
        })

    } catch(error){
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error'})
    }
}

//@route api/auth/login
//@desc post loginform
//@access public
exports.login = async(req, res) => {
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({success: false, message: 'Missing field'})
    }

    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({success: false, message: 'Incorrect'})
        }

        const passwordValid = await bcrypt.compareSync(password, user.password)

        if(!passwordValid){
            return res.status(400).json({success: false, message: 'Incorrect'})
        }

        const accessToken = jwt.sign({userID: user._id.toString()}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'Loggin successfully',
            accessToken
        })
        console.log(user._id)
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: error.message})
    }
}

//@route api/auth/addUser
//@desc post loginform
//@access private
exports.addUser = async(req, res) => {
    const {firstname, lastname, email, password} = req.body
    if(!firstname || !lastname || !email || !password){
        return res.status(400).json({success: false, message: 'Missing field'})
    }

    try{
        const user_email = await User.findOne({email})

        if(user_email){
            return res.status('400').json({success: false, message: 'Email exist'})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let temp = firstname.slice(0,1);
        const avatar = 'http://localhost:5000/avatar/default/' +`${temp}.jpg` 

        const newUser = new User({email, firstname, lastname, password: hashedPassword, avatar})
        await newUser.save()

        const accessToken = jwt.sign({userID: newUser._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'User created successfully',
            accessToken
        })

    } catch(error){
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error'})
    }
}

//@route api/auth/forgot-password
//@desc post email
//@access public
// exports.forgotPassword = (req, res) => {
//     const {email} = req.body
    
//     User.findOne({email}, (err, user) => {
//         if(err || !user) {
//             return res.status(400).json({success: false, message: "User with this email doesnot exist"})

//         }

//         const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY)

//         const data = {
//             from: 'noreply@hello.com',
//             to: email,
//             subject: 'Reset Password Link',
//             html: `
//                 <h2> Nhấn vào link sau đây để reset password</h2>
//                 <p>${process.env.CLIENT_URL}/auth/reset-password/${token}</p>
//             `
//         }

//         return user.updateOne({resetLink: token}, (err, success) => {
//             if(err){
//                 return res.status(400).json({success: false, message: err.message})
//             } else {
//                 mg.messages().send(data, function (error, body) {
//                     if (error) {
//                         return res.status(200).json({success: false, message: error.message })
//                     }
//                     return res.status(200).json({success: true, message: 'Email has been sent'})
//                 });
//             }
//         })
//     })
// }

