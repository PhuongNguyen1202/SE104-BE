'use strict';


import savePost from "../models/savePost.js";



///lưu một bài post
export const saveToPost = async (req, res) => {
    
        console.log("SAVE A POST");
        const id_post = req.body.id_post;//để lấy giá trị của body
        const id_user = req.params.id_user;//To do: đăng nhập
        ///kiểm tra list_post có tồn tại kg
     try{
        const save_post = await savePost.findOne({ id_user});
        if (save_post){ // đã có savePost
            let itemIndex = save_post.list_post.includes(id_post);
            
            if (itemIndex) {
                //bài post đã lưu, thông báo
               return  res.status(200).json({ message: "Before post was saved! " })
              } else {
                //chưa  lưu, thêm vào
                save_post.list_post.push(id_post);
              }
              const data = await save_post.save();
              console.log(data);
              return res.status(200).json({ message: "Saved success" });
        }
        else {//  chưa có savePost
            const newSavePost = new savePost({
                id_user,
                list_post: [
                    id_post
                ]
            });
            console.log(id_post);
            const aSavePost = await newSavePost.save()
            res.status(200).json({ message: "Saved success" });
        }  
    }catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getAllPostInSavePost = async (req, res) => {
    try {
        console.log('get ALL POST IN SAVE_POST');
        const id_user = req.params.id_user;
        const save_post = await savePost.findOne({id_user});
        res.status(200).json(save_post.list_post);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

/// xóa một bài viết đã lưu trước đó
export const deletePostInSavePost = async (req, res) => {
    try {
        console.log('DELETE A POST IN SAVEPOST');
        const id_post = req.body.id_post;
        const id_user = req.params;
        const save_post = await savePost.findOneAndUpdate(id_user, {
            $pull: {
                 list_post: id_post  
            }
        }, {new: true});
        const data = await save_post.save();
        res.status(200).json({ message: "Deleted a saved post in SavePost" });
        console.log (save_post);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

