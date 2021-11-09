'use strict';
import express from 'express'
const router = express.Router()
<<<<<<< HEAD
import {getUserInfo, updateUserInfo, updatePassword, forgotPassword, resetPassword, changeAvatar} from '../controllers/user.js'
import {verifyToken} from'../middlewares/verifyToken.js'
=======
const userController = require('../controllers/user')
const {verifyToken} = require('../middlewares/verifyToken')
>>>>>>> origin/role

router.get('/profile',verifyToken, getUserInfo)

router.put('/update', verifyToken, updateUserInfo)

router.put('/changepassword', verifyToken, updatePassword)

router.put('/forgot-password', forgotPassword)

router.put('/reset-password/:token', resetPassword)

router.put('/change-avatar', verifyToken, changeAvatar)

export default router;