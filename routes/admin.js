'use strict';
import express from 'express'
const router = express.Router()
import {deleteUserById, deleteUsers, getAllUsers} from '../controllers/admin.js'

router.get('/get-users', getAllUsers)
router.delete('/delete-user/:id', deleteUserById)
router.delete('/delete-users', deleteUsers)

export default router;