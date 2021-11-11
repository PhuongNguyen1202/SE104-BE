 'use strict';
import User from '../models/User.js'

//@route api/addmin/get-users
//@desc get list users except resetlink
//@access private
export const getAllUsers = async(req, res) => {
    try{
        const users = await User.find({}, {resetLink: 0})
        if(!users){
            return res.status(404).json({succes: false, message: "Can not get all data"})
        }
        return res.status(200).json({succes: true, data: users})
    }
    catch (err){
        return res.status(500).json({succes: false, message: err.message})
    }
}

//@route api/addmin/delete-user
//@desc delete one user 
//@access private
export const deleteUserById = async (req, res) => {
    try {
        let id_user = req.params.id;
        const user = await User.findById(id_user);
        if (!user)
            return res.status(200).json({success: false, message: "User is not exist" })
        await User.findByIdAndDelete(id_user, { useFindAndModify: true })
        return res.status(200).json({success:true, message: "User deleted" })
    } catch (error) {
        return res.status(400).json({success:false, message: error.message })
    }
}
//@route api/addmin/delete-user
//@desc delete one user 
//@access private
export const deleteUsers = async (req, res) => {
    try {
        var id_deleted = []
        let id_users = req.body.id_users;
        for (let id of id_users) {
            let user = await User.findById(id);
            if(user){
            await User.findByIdAndDelete(id, { useFindAndModify: true })
            id_deleted.push(id)}
        }
        console.log(id_deleted)
        if(id_deleted.length == 0){
            return res.status(200).json({success:false, message: "There is no user deleted" })
        }
        return res.status(200).json({success:true, message: `users with id ${id_deleted} deleted` })
    } catch (error) {
        return res.status(400).json({success:false, message: error.message })
    }
}
//delete all users
