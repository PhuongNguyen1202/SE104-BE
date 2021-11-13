'use strict';
import express from 'express'
const router = express.Router()
import {deleteUserById, deleteUsers, getAllUsers, deleteAllUsers} from '../controllers/admin.js'

router.get('/get-users', getAllUsers)
router.delete('/delete-user/:id', deleteUserById)
router.delete('/delete-users', deleteUsers)
router.delete('/deleteAllUsers', deleteAllUsers)

export default router;