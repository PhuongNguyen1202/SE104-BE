'use strict';


import savePost from "../models/savePost.js";
import Post from "../models/post.js";
import User from "../models/User.js";
import PostDetail from "../models/post_detail.js";



///lưu một bài post
//http://localhost:5000/save_post/saved
export const saveToPost = async (req, res) => {
    
        console.log("SAVE A POST");
        const id_post = req.body.id_post;
        const id_user = req.userID;
        ///kiểm tra list_post có tồn tại kg
     try{
        const save_post = await savePost.findOne({ id_user});
        if (save_post){ // đã có savePost
            let itemIndex = save_post.list_post.includes(id_post);
            
            if (itemIndex) {
                //bài post đã lưu, thông báo
               return  res.status(200).json({ success: 0, message: "Before post was saved! " })
              } else {
                //chưa  lưu, thêm vào
                save_post.list_post.push(id_post);
              }
              const data = await save_post.save();
              console.log(data);
              return res.status(200).json({  success: 1, message: "Saved success" });
        }
        else {//  chưa có savePost
            const newSavePost = new savePost({
                id_user,
                list_post: [
                    id_post
                ]
            });
            console.log(id_post);
            const SavePost = await newSavePost.save()
            res.status(200).json({  success: 1, message: "Saved success" });
        }  
    }catch (error) {
        res.status(404).json({ message: error.message })
    }
}


//Lấy danh sách list_post được lưu
//http://localhost:5000/save_post
export const getAllPostInSavePost = async (req, res) => {
    try {
        console.log('get ALL POST IN SAVE_POST');
        const id_user = req.userID;
        const save_post = await savePost.findOne({id_user});
        if (!save_post) {//không có save_post
            return res.status(400).json({success: 0, message: 'savePost not exit'})
        }
        else {
            if(save_post.list_post.length == 0){
                return res.status(400).json({success: 0, message: 'no post saved'})
            }
            else {
                const data = [];
                for (let temp of save_post.list_post){
                    const post = await Post.findById(temp)//tìm bài post với id
                    //console.log(temp1);
                    
                    const InfoPost = {//thông tin cần lấy của mỗi bài post
                        "id_post":"",
                        "title": "",
                        "author": "",
                        "thumbnail_image": "",
                        "description": ""
                    }
                    const post_id_user = post.id_user;// lấy id_user của bài post lưu đó
                    const user = await User.findById(post_id_user)
                    const author = user.lastname.concat(" ",user.firstname) //lấy tên tác giả
                    InfoPost.author = author;
                    InfoPost.id_post = temp;
                    InfoPost.title = post.title; //lấy tiêu đề
                    InfoPost.thumbnail_image = post.thumbnail_image;//lấy ảnh của bài post
                    const detailPost = await PostDetail.findOne({id_post: temp})//tìm detail để lấy description
                    InfoPost.description = detailPost.description;
                    //console.log(InfoPost);
                    data.push(InfoPost);
                }
                //console.log(data);
                res.status(200).json({success: 1, data});
            }
        }
   
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

/// xóa một bài viết đã lưu trước đó
//http://localhost:5000/save_post/unsaved
export const deletePostInSavePost = async (req, res) => {
    try {
        console.log('DELETE A POST IN SAVEPOST');
        const id_post = req.body.id_post;
        const id_user = req.userID;
        const save_post = await savePost.findOneAndUpdate({id_user}, {
            $pull: {
                 list_post: id_post  
            }
        }, {new: true});
        await save_post.save();
        res.status(200).json({ message: "Success" });
        //console.log (save_post);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//Xóa nhiều bài viết đã lưu trước đó
//http://localhost:5000/save_post/many_unsaved
export const deleteManyPostInSavePost = async (req, res) => {
    try {
        console.log('DELETE MANY POST IN SAVEPOST');
        const list_post = req.body.list_post;
        const id_user = req.userID;
        const save_post = await savePost.findOneAndUpdate({id_user}, {
            $pullAll: {
                 list_post: list_post  
            }
        }, {new: true});
        await save_post.save();
        res.status(200).json({ message: "Success" });
        //console.log (save_post);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//Xóa tất cả các bài viết đã lưu
//http://localhost:5000/save_post/all_unsaved
export const deleteAll_ListPostInSavePost = async(req, res) => {
    try {
        console.log('DELETE ALL POST IN SAVEPOST');
        const id_user = req.userID;
        const save_post = await savePost.findOneAndUpdate({id_user}, {
            $set: { list_post: [] }
            }, {new: true});
            await save_post.save();
            res.status(200).json({ message: "Success"})   
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}