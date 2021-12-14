'use strict';
import fs from 'fs'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import dotenv from 'dotenv';
dotenv.config();
import mailgun from "mailgun-js";
import Joi from "joi"

const DOMAIN = "sandboxf323020c2b1642a691a15da4ac044d8b.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

import User from '../models/User.js'

//@route api/user/profile/
//@desc get user profile
//@access private
export const getUserInfo = async(req, res) => {
    try{
        let profile = await User.findById(req.userID).populate({
            path: 'role',
            select: 'role_name'
        })
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
        if(!firstname || !lastname || !gender){
            return res.status(400).json({success: false, message: "Missing field"})
        }
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
        const {oldPassword, newPassword, confirmPassword} = req.body
        const rule = Joi.object().keys({
            oldPassword, 
            newPassword: Joi.string().min(8).pattern(new RegExp("^(?=.*?[0-9])(?=.*?[#?!@$%^&*-])")),
            confirmPassword
        }); 
        const result = rule.validate(req.body); 
        const { value, error } = result; 
        if(!oldPassword || !newPassword || ! confirmPassword){
            return res.status(400).json({success: false, message: "Thông tin không hợp lệ."})
        }
        if (error) { 
            return res.status(422).json({ 
                success: false,
                message: "Mật khẩu phải có tổi thiểu 8 kí tự, bao gồm chữ số và một số kí tự đặc biệt."  
            }) 
          }
        if(newPassword !== confirmPassword){
            return res.status(422).json({success:false, message: "Vui lòng kiểm tra lại mật khẩu" })
        }
        const user = await User.findById(req.userID)
        if (user) {
            const passwordValid = await bcrypt.compareSync(oldPassword, user.password)

            if (!passwordValid) return res.status(422).json({success: false, message: "Sai mật khẩu" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const userPassword = await User.findByIdAndUpdate(req.userID, {
            password: hashedPassword
        });
        return res.status(200).json({success: true, message: "Password changed!" })

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
            return res.status(400).json({success: false, message: "Thông tin không hợp lệ!"})
        }
        const user = await User.findOne({ email })
        if (!user) return res.status(422).json({ success: false, message: "Địa chỉ Email không tồn tại!" });
        //If email is correct
        const token = jwt.sign(
            { _id: user._id },
            process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'})

        const data = {
            from: 'nomnom@hello.com',
            to: email,
            subject: 'Reset Password Link',
            html: `
                        <h2>Nhấn vào link sau đây để reset password</h2>
                        <a>${process.env.CLIENT_URL}/resetpassword/${token}</a>`
        };

        const userupdate = await User.findByIdAndUpdate(user._id, { resetLink: token }, { new: true });
        await mg.messages().send(data, function (error, body) {
            if (error) {
                res.status(422).json({success: false, message: 'Vui lòng kiểm tra lại địa chỉ Email.' })
            }
            else res.status(200).json({success: true, message: "Email đã được gửi thành công."})
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
        const {newPass, confirmPass} = req.body
        const rule = Joi.object().keys({ 
            newPass: Joi.string().min(8).pattern(new RegExp("^(?=.*?[0-9])(?=.*?[#?!@$%^&*-])")),
            confirmPass
        }); 
        const result = rule.validate(req.body); 
        const { value, error } = result; 
        if(!newPass || !confirmPass){
            return res.status(400).json({success: false, message: 'Thông tin không hợp lệ.'})
        }
        if (error) { 
            return res.status(422).json({ 
                success: false,
                message: "Mật khẩu phải có tổi thiểu 8 kí tự, bao gồm chữ số và một số kí tự đặc biệt."  
            }) 
          }
        if(newPass !== confirmPass){
            return res.status(422).json({success:false, message: "Mật khẩu mới và xác nhận mật khẩu không khớp." })
        }

        if(resetLink){
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, async (err, decodedData) =>{
                if(err){
                    return res.status(401).json({success: false, message: err.message})
                }

                User.findOne({resetLink}, async (err,user) =>{
                    if(err || !user){
                        return res.status(400).json({success: false, message: 'Vui lòng kiểm tra lại địa chỉ Email.'})
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
                        else res.status(200).json({success: true, message: 'Mật khẩu đã được cập nhật thành công!'})
                    })
                })
            })
        }
        else{
           return res.status(401).json({success: false, message: 'Lỗi xác thực'})
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

        const user = await User.findByIdAndUpdate(req.userID,{ avatar: new_avatar}, { new: true }).populate({
            path: 'role',
            select: 'role_name'
        })
        return res.status(200).json({success: true, data: user})

    }
    catch(err){
        return res.status(400).json({success: false, message: err.message})
    }
}

