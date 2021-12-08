'use strict';
import express from 'express'
const router = express.Router()
import {deleteUserById, deleteUsers, getAllUsers, deleteAllUsers, addUser} from '../controllers/admin.js'
import {isAdmin} from '../middlewares/isAdmin.js'
import {verifyToken} from '../middlewares/verifyToken.js'

router.get('/get-users',[verifyToken, isAdmin] , getAllUsers)
router.post('/addUser', [verifyToken, isAdmin] , addUser)
router.delete('/delete-user/:id',[verifyToken, isAdmin] , deleteUserById)
router.delete('/delete-users',[verifyToken, isAdmin] , deleteUsers)
router.delete('/deleteAllUsers',[verifyToken, isAdmin] , deleteAllUsers)

export default router;