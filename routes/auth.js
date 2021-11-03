'use strict';
const express = require('express')
const router = express.Router()
var authController = require('../controllers/auth')
// const upload = require('../midleware/upload')

router.post('/register', authController.registerUser)

router.post('/login', authController.login)

router.post('/add-user', authController.addUser)


module.exports = router