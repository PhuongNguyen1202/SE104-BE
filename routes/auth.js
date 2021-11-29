'use strict';
import express from 'express'
const router = express.Router()
import {registerUser,login,addUser} from '../controllers/auth.js'
import {isAdmin} from '../middlewares/isAdmin.js'
import {verifyToken} from '../middlewares/verifyToken.js'
// const upload = require('../midleware/upload')


router.post('/register', registerUser)

router.post('/login', login)

router.post('/add-user',[verifyToken, isAdmin], addUser)


export default router;