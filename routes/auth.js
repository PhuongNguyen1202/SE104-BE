'use strict';
import express from 'express'
const router = express.Router()
import {registerUser,login,addUser} from '../controllers/auth.js'
// const upload = require('../midleware/upload')
import {checkRoleExist} from'../middlewares/checkRole.js'


router.post('/register',checkRoleExist, registerUser)

router.post('/login', login)

router.post('/add-user', addUser)


export default router;