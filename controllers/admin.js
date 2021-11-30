 'use strict';
import User from '../models/User.js'
import Post from '../models/post.js';
import PostDetail from '../models/post_detail.js';
import savePost from '../models/savePost.js';
import likePost from '../models/reactions.js'

const DEFAULT_FOLDER_UPLOAD_IMAGE = './public/post/image';
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
        const list_post = await Post.find({ id_author: user_id });
        if(!list_post)
            return res.status(200).json({succes: true, message: "User has no post"})
        //delet post and detail post
        let thumbnail_name = [];
        let list_id_post = [];
        list_post.forEach(post => {
            let temp = post.thumbnail_image.split('/');
            thumbnail_name.push(temp[5]);
            list_id_post.push(post._id);
        });
        //delete post
        await Post.deleteMany({ id_author: id_user }, { useFindAndModify: true }, console.log("delete post"))
        //delete detail
        await PostDetail.deleteMany({ id_post: { $in: list_id_post } }, { useFindAndModify: true }, console.log("delete detail"))
        //delete image
        thumbnail_name.forEach(e => {
            fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + e, function (err) {
                if (err) console.error(err);
                console.log('File has been Deleted');
            })
        });
        //delete savepost của user
        await savePost.findByIdAndDelete(id_user, { useFindAndModify: true },console.log("delete savePost của user"))
        //delete reaction của user trong post khác
        await likePost.findOneAndUpdate( {id_user: { $in: list_user }}, {
            $pull: {
                 list_user: id_user
            }
        }, {new: true}, console.log("Delete reaction của user trong post khác"));
        //delete post trong savepost của user khác
        list_id_post.forEach(async id_post => {
            await savePost.findOneAndUpdate( {id_post: { $in: list_post }}, {
                $pull: {
                     list_post: id_post  
                }
            }, {new: true},console.log("delete post trong savepost của user khác"));
            //delete reaction của post của user
            await likePost.findByIdAndDelete( id_post, { useFindAndModify: true }, console.log("delete reaction của post của user"));
        })

        await User.findByIdAndDelete(id_user, { useFindAndModify: true }, console.log("delete user thành công"))
        return res.status(200).json({success:true, message: "User deleted" })
    } catch (error) {
        return res.status(400).json({success:false, message: error.message })
    }
}
//@route api/addmin/delete-users
//@desc delete many users 
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

//@route api/addmin/deleteAllUsers
//@desc delete all user 
//@access private
export const deleteAllUsers = async(req, res) => {
    try {
        const role = "user"
        if (!role) return res.status(200).json({succes: false, message: "Role not null"})

        await User.deleteMany({role: role}, {useFindAndModify: true})
        res.status(200).json({succes: true, message: "Success"})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}
