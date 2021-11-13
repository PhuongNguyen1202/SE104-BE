'use strict';
import fs from 'fs'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import dotenv from 'dotenv';
dotenv.config();
import mailgun from "mailgun-js";

const DOMAIN = "sandbox48a37214ab4c4cbab4dfad57cb451d9e.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

import User from '../models/User.js'

//@route api/user/profile/
//@desc get user profile
//@access private
export const getUserInfo = async(req, res) => {
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
export const updateUserInfo = async (req, res) => {
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
export const updatePassword = async (req, res) => {
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
export const forgotPassword = async (req, res) => {
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
//@desc put password
//@access private
export const resetPassword = async (req, res) => {
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

//@route api/user/change-avatar
//@desc put avatar
//@access private
const DEFAULT_FOLDER_UPLOAD_IMAGE = './public/avatar/customs';
const URL_HOST = 'http://localhost:5000/'

const solvePathURL = path => {
    let new_path = path.split('/').slice(2).join('/');
    let full_path = URL_HOST + new_path;

    return full_path;
}

const saveImage = (folder, nameImage, base64) => {
    const type = base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
    const base64_replace = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const path = folder + '/' + nameImage + '.' + type;

    fs.writeFileSync(path, base64_replace, 'base64');

    const full_path = solvePathURL(path);
    return full_path;
}

export const changeAvatar = async (req, res) => {
    try{
        const {avatar} = req.body
        if(!avatar){
            return res.status(400).json({success: false, message: 'Avatar has not been selected'})
        }
        let avatar_name = req.userID + '_avatar';
        let new_avatar = await saveImage(DEFAULT_FOLDER_UPLOAD_IMAGE, avatar_name, avatar);
        console.log('update image')

        const user = await User.findByIdAndUpdate(req.userID,{ avatar: new_avatar}, { new: true })
        return res.status(200).json({success: true, data: user})

    }
    catch(err){
        return res.status(400).json({success: false, message: err.message})
    }
}
