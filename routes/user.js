'use strict';
import express from 'express'
const router = express.Router()
import {getUserInfo, updateUserInfo, updatePassword, forgotPassword, resetPassword, changeAvatar} from '../controllers/user.js'
import {verifyToken} from'../middlewares/verifyToken.js'
import {isUser} from '../middlewares/isUser.js'

router.get('/profile',[verifyToken, isUser], getUserInfo)

router.put('/update', [verifyToken, isUser], updateUserInfo)

router.put('/changepassword', [verifyToken, isUser], updatePassword)

router.post('/forgot-password', forgotPassword)

router.put('/reset-password/:token', resetPassword)

router.put('/change-avatar', [verifyToken, isUser], changeAvatar)

export default router;