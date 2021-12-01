'use strict';
import express from 'express'
const router = express.Router()
import {registerUser,login,addUser,loginFacebook,loginGoogle} from '../controllers/auth.js'
import {isAdmin} from '../middlewares/isAdmin.js'
import {verifyToken} from '../middlewares/verifyToken.js'
// const upload = require('../midleware/upload')


router.post('/register', registerUser)

router.post('/login', login)

router.post('/add-user', addUser)

router.post('/login-facebook', loginFacebook)

router.post('/login-google',loginGoogle)
export default router;