'use strict';
import express from 'express'
const router = express.Router()
import {getUserInfo, updateUserInfo, updatePassword, forgotPassword, resetPassword, changeAvatar} from '../controllers/user.js'
import {verifyToken} from'../middlewares/verifyToken.js'


router.get('/profile',verifyToken, getUserInfo)

router.put('/update', verifyToken, updateUserInfo)

router.put('/changepassword', verifyToken, updatePassword)

router.put('/forgot-password', forgotPassword)

router.put('/reset-password/:token', resetPassword)

router.put('/change-avatar', verifyToken, changeAvatar)

export default router;