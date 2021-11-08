'use strict';
const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const {verifyToken} = require('../middlewares/verifyToken')

router.get('/profile',verifyToken, userController.getUserInfo)

router.put('/update', verifyToken, userController.updateUserInfo)

router.put('/changepassword', verifyToken, userController.updatePassword)

router.put('/forgot-password', userController.forgotPassword)

router.put('/reset-password/:token', userController.resetPassword)
module.exports = router