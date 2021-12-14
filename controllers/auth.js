'use strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';
import Joi from "joi"

import User from '../models/User.js'
import Role from '../models/Role.js'

import axios from 'axios';
const client = new OAuth2Client("811148561616-u5o162igd4bdqkb26lan40e7t356hh7f.apps.googleusercontent.com")
//@route api/auth/register
//@desc post registerform
//@access public

export const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, gender } = req.body
    const rule = Joi.object().keys({
        firstname,
        lastname,
        email,
        password: Joi.string().min(8).pattern(new RegExp("^(?=.*?[0-9])(?=.*?[#?!@$%^&*-])")),
        gender
    });
    const result = rule.validate(req.body);
    const { value, error } = result;
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' })
    }
    if (error) {
        return res.status(422).json({
            success: false,
            message: "Mật khẩu phải có tổi thiểu 8 kí tự, bao gồm chữ số và một số kí tự đặc biệt."
        })
    }
    try {
        const user_email = await User.findOne({ email })

        if (user_email) {
            return res.status('400').json({ success: false, message: 'Địa chỉ email đã tồn tại' })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let temp = firstname.slice(0, 1);
        const avatar = 'http://localhost:5000/avatar/default/' + `${temp}.jpg`

        const user = new User({ email, firstname, lastname, password: hashedPassword, gender, avatar })
        const role = await Role.findOne({ role_name: "user" })
        if (!role) {
            return res.status(500).json({ success: false, message: "Thông tin không hợp lệ" })
        }

        user.role = role._id
        user.save((err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
        });

        const accessToken = jwt.sign({ userID: user._id }, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'Tài khoản đã được tạo thành công',
            accessToken
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Lỗi server' })
    }
}

//@route api/auth/login
//@desc post loginform
//@access public
export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' })
        }

        const passwordValid = await bcrypt.compareSync(password, user.password)

        if (!passwordValid) {
            return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' })
        }

        const accessToken = jwt.sign({ userID: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            accessToken
        })
        console.log(user._id)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}


//@route api/auth/login-facebook
//@desc post 
//@access public
export const loginFacebook = async (req, res) => {

    try {
        const { userID, accessToken } = req.body;

        let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture,gender&access_token=${accessToken}`

        let email, name;
        await axios.get(urlGraphFacebook)
            .then((res) => res.data)
            .then((data) => {
                console.log(data);
                email = data.email;
                name = data.name;
            })
            .catch((err) => {
                return res.status(400).json(err);
            })

        User.findOne({ email }).exec(async (err, user) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message })
            } else {
                if (user) {
                    const accessToken = jwt.sign({ userID: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET)
                    res.json({
                        success: true,
                        message: 'Đăng nhập thành công!',
                        accessToken
                    })
                } else {
                    console.log('name: ', name);
                    const temp = name.slice(0, 1);
                    const avatar = 'http://localhost:5000/avatar/default/' + `${temp}.jpg`

                    const gender = 'Nữ';
                    const user = new User({ email, firstname: name, gender, avatar })
                    const role = await Role.findOne({ role_name: "user" })
                    if (!role) {
                        return res.status(500).json({ success: false, message: "Role is null" })
                    }

                    user.role = role._id
                    user.save((err) => {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                    });

                    const accessToken = jwt.sign({ userID: user._id }, process.env.ACCESS_TOKEN_SECRET)
                    res.json({
                        success: true,
                        message: 'Tạo tài khoản thành công!',
                        accessToken
                    })
                }
            }
        })

    } catch (error) {
        res.status(400).json(error);
    }
}

//@route api/auth/login-google
//@desc post
//@access public
export const loginGoogle = async (req, res) => {
    const { tokenId } = req.body

    client.verifyIdToken({ idToken: tokenId, audience: "811148561616-u5o162igd4bdqkb26lan40e7t356hh7f.apps.googleusercontent.com" }).then(async response => {
        const { email_verified, name, email } = response.payload
        if (email_verified) {
            User.findOne({ email }).exec(async (err, user) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        err: err.message
                    })
                } else {
                    if (user) {
                        const accessToken = jwt.sign({ userID: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET)
                        res.json({
                            success: true,
                            message: 'Đăng nhập thành công!',
                            accessToken
                        })
                    } else {
                        let temp = name.slice(0, 1);
                        const avatar = 'http://localhost:5000/avatar/default/' + `${temp}.jpg`
                        const gender = 'Nữ';
                        const user = new User({ email, firstname: name, avatar, gender })
                        const role = await Role.findOne({ role_name: "user" })
                        if (!role) {
                            return res.status(500).json({ success: false, message: "Role is null" })
                        }

                        user.role = role._id
                        user.save((err) => {
                            if (err) return res.status(500).json({ success: false, message: err.message });
                        });

                        const accessToken = jwt.sign({ userID: user._id }, process.env.ACCESS_TOKEN_SECRET)
                        res.json({
                            success: true,
                            message: 'Tạo tài khoản thành công!',
                            accessToken
                        })
                    }
                }
            })
        }
    })
}


