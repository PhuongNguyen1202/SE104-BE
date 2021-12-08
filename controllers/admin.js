 'use strict';
import User from '../models/User.js'
import Post from '../models/post.js';
import PostDetail from '../models/post_detail.js';
import savePost from '../models/savePost.js';
import likePost from '../models/reactions.js'
import Roles from '../models/Role.js';
import Joi from "joi"

const DEFAULT_FOLDER_UPLOAD_IMAGE = './public/post/image';
import fs from 'fs';
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
        let user_id = req.params.id;
        const user = await User.findById(user_id);
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
        console.log(list_id_post)
        //delete savepost của user
        await savePost.findByIdAndDelete(user_id, { useFindAndModify: true },console.log("delete savePost của user"))
        //delete reaction của user trong post khác
        await likePost.findOneAndUpdate({list_user: user_id}, {
            $pull: {
                 list_user: user_id 
            }
        }, {new: true}, console.log("Delete reaction của user trong post khác"));
        //delete post trong savepost của user khác
            await savePost.updateMany( { id_post: { $in: list_id_post }}, {
                $pull: {
                    list_post:
                        { $in: list_id_post }
            }}, {new: true},console.log("delete post trong savepost của user khác"));
            //delete reaction của post của user
            await likePost.deleteMany( { id_post: { $in: list_id_post }}, { useFindAndModify: true }, console.log("delete reaction của post của user"));
            //delete post
            await Post.deleteMany({ id_author: user_id }, { useFindAndModify: true }, console.log("delete post"))
            //delete detail
            await PostDetail.deleteMany({ id_post: { $in: list_id_post } }, { useFindAndModify: true }, console.log("delete detail"))
            //delete image
            thumbnail_name.forEach(e => {
                fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + e, function (err) {
                    if (err) console.error(err);
                    console.log('File has been Deleted');
                })
            });

            await User.findByIdAndDelete(user_id, { useFindAndModify: true }, console.log("delete user thành công"))
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
        let id_users = req.body.id_users;

        if(id_users.length == 0){
            return res.status(200).json({success:false, message: "There is no user deleted" })
        }
        const user = await User.find({ _id: { $in: id_users }});
        if (!user)
            return res.status(200).json({success: false, message: "There is no users" })
        const list_post = await Post.find({ id_author: { $in: id_users }});
        if(!list_post)
            return res.status(200).json({succes: true, message: "There is no post"})
        //delet post and detail post
        let thumbnail_name = [];
        let list_id_post = [];
        list_post.forEach(post => {
            let temp = post.thumbnail_image.split('/');
            thumbnail_name.push(temp[5]);
            list_id_post.push(post._id);
        });
        console.log(list_id_post)
        //delete savepost của user
        await savePost.deleteMany({id_user: { $in: id_users }}, { useFindAndModify: true },console.log("delete savePost của user"))
        //delete reaction của user trong post khác
        id_users.forEach(async id => {
            await likePost.updateMany({list_user: id}, {
                $pull: {
                     list_user: id 
                }
            }, {new: true}, console.log("Delete reaction của user trong post khác"));
        })
        
        //delete post trong savepost của user khác
            await savePost.updateMany( { id_post: { $in: list_id_post }}, {
                $pull: {
                    list_post:
                        { $in: list_id_post }
            }}, {new: true},console.log("delete post trong savepost của user khác"));
            //delete reaction của post của user
            await likePost.deleteMany( { id_post: { $in: list_id_post }}, { useFindAndModify: true }, console.log("delete reaction của post của user"));
            //delete post
            await Post.deleteMany({ id_author: { $in: id_users } }, { useFindAndModify: true }, console.log("delete post"))
            //delete detail
            await PostDetail.deleteMany({ id_post: { $in: list_id_post } }, { useFindAndModify: true }, console.log("delete detail"))
            //delete image
            thumbnail_name.forEach(e => {
                fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + e, function (err) {
                    if (err) console.error(err);
                    console.log('File has been Deleted');
                })
            });

            await User.deleteMany({_id: { $in: id_users }}, { useFindAndModify: true }, console.log("delete user thành công"))
            return res.status(200).json({success:true, message: "User deleted" })

    } catch (error) {
        return res.status(400).json({success:false, message: error.message })
    }
}

//@route api/addmin/deleteAllUsers
//@desc delete all user 
//@access private
export const deleteAllUsers = async(req, res) => {
    try {
        const role = await Roles.findOne({role_name: "user"})
        if(!role){
            return res.status(500).json({success: false, message: "Role is null"})
        }
        
        const id_users = []
        const users = await User.find({role: role._id})
        if (!users)
        return res.status(200).json({success: false, message: "There is no users" })
        users.forEach(user => {
            id_users.push(user._id)
        })
        console.log(id_users)
        const list_post = await Post.find({ id_author: { $in: id_users }});
        if(!list_post)
            return res.status(200).json({succes: true, message: "There is no post"})
        //delet post and detail post
        let thumbnail_name = [];
        let list_id_post = [];
        list_post.forEach(post => {
            let temp = post.thumbnail_image.split('/');
            thumbnail_name.push(temp[5]);
            list_id_post.push(post._id);
        });
        console.log(list_id_post)
        //delete savepost của user
        await savePost.deleteMany({id_user: { $in: id_users }}, { useFindAndModify: true },console.log("delete savePost của user"))
        //delete reaction của user trong post khác
        id_users.forEach(async id => {
            await likePost.updateMany({list_user: id}, {
                $pull: {
                     list_user: id 
                }
            }, {new: true}, console.log("Delete reaction của user trong post khác"));
        })
        
        //delete post trong savepost của user khác
            await savePost.updateMany( { id_post: { $in: list_id_post }}, {
                $pull: {
                    list_post:
                        { $in: list_id_post }
            }}, {new: true},console.log("delete post trong savepost của user khác"));
            //delete reaction của post của user
            await likePost.deleteMany( { id_post: { $in: list_id_post }}, { useFindAndModify: true }, console.log("delete reaction của post của user"));
            //delete post
            await Post.deleteMany({ id_author: { $in: id_users } }, { useFindAndModify: true }, console.log("delete post"))
            //delete detail
            await PostDetail.deleteMany({ id_post: { $in: list_id_post } }, { useFindAndModify: true }, console.log("delete detail"))
            //delete image
            thumbnail_name.forEach(e => {
                fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + e, function (err) {
                    if (err) console.error(err);
                    console.log('File has been Deleted');
                })
            });

            await User.deleteMany({_id: { $in: id_users }}, { useFindAndModify: true }, console.log("delete user thành công"))
        return res.status(200).json({success:true, message: "User deleted" })
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

//@route api/admin/addUser
//@desc post loginform
//@access private
export const addUser = async(req, res) => {
    const {firstname, lastname, email, password, gender, role} = req.body
    if(!firstname || !lastname || !email || !password || !gender || !role){
        return res.status(400).json({success: false, message: 'Missing field'})
    }
    const rule = Joi.object().keys({
        firstname,
        lastname,
        email, 
        password: Joi.string().min(8).pattern(new RegExp("^(?=.*?[0-9])(?=.*?[#?!@$%^&*-])")),
        gender,
        role
    }); 
    const result = rule.validate(req.body); 
    const { value, error } = result; 
    if (error) { 
        return res.status(422).json({ 
            success: false,
            message: "Mật khẩu phải có tổi thiểu 8 kí tự, bao gồm chữ số và một số kí tự đặc biệt."  
        }) 
      }
    try{
        const user_email = await User.findOne({email})

        if(user_email){
            return res.status('400').json({success: false, message: 'Email exist'})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let temp = firstname.slice(0,1);
        const avatar = 'http://localhost:5000/avatar/default/' +`${temp}.jpg` 

        const newUser = new User({email, firstname, lastname, password: hashedPassword, avatar, gender})
        const newUserRole = await Role.findOne({role_name: role})
        if(!newUserRole){
            return res.status(500).json({success: false, message: "Role is null"})
        }
        
        newUser.role = newUserRole._id
        newUser.save((err) => {
            if (err) return res.status(500).json({success:false, message: err.message });
            });

        const accessToken = jwt.sign({userID: newUser._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({
            success: true,
            message: 'User created successfully',
            accessToken
        })

    } catch(error){
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error'})
    }
}
