'use strict';


import likePost from "../modules/reactions.js";



///like một bài post
export const likeAPost = async (req, res, next) => {
    
        console.log("LIKE A POST");
        const id_user = req.body.id_user;
        const id_post = req.params.id_post;//To do: _id post được like
        ///kiểm tra list_user có tồn tại kg
     try{
        const like_post = await likePost.findOne({ id_post});
        if (like_post){ // đã có likePost
            let itemIndex = like_post.list_user.includes(id_user);
            console.log(itemIndex);
            if (itemIndex) {
                //bài post đã được user like trước đó, thông báo
               return  res.status(200).json({ message: "Before post was liked! " })
              } else {
                //user chưa like bài post, thêm vào
                like_post.list_user.push(id_user);
              }
              const data = await like_post.save();
              console.log(data);
              return res.status(200).json({ message: "Liked success" });
        }
        else {//  chưa có likePost
            const newlikePost = new likePost({
                id_post,
                list_user: [
                    id_user
                ]
            });
            const aLikePost = await newlikePost.save()
            console.log(aLikePost);
            res.status(200).json({ message: "Liked success" });
        }  
    }catch (error) {
        res.status(404).json({ message: error.message })
    }
}

/// unlike một bài viết
export const unlikePost = async (req, res, next) => {
    try {
        console.log('UNLIKE A POST');
        const id_user = req.body.id_user;
        const id_post = req.params;
        const like_post = await likePost.findOneAndUpdate(id_post, {
            $pull: {
                 list_user: id_user 
            }
        }, {new: true});
        const data = await like_post.save();
        res.status(200).json({ message: "Unliked success" });
        console.log (data);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}






