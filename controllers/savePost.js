'use strict';


import savePost from "../models/savePost.js";
import Post from "../models/post.js";
import User from "../models/User.js";

//
const LIMIT_OF_POST_DEFAULT = process.env.LIMIT_OF_POST_DEFAULT;
const CURRENT_PAGE_DEFAULT = process.env.CURRENT_PAGE_DEFAULT;


///lưu một bài post
//http://localhost:5000/save_post/saved
export const saveToPost = async (req, res) => {
    try {
        console.log("SAVE A POST");
        const id_post = req.body.id_post;
        const id_user = req.userID;
        if (!id_post) {
            return res.status(200).json({ message: "Not NULL" });
        }
        if (!id_post.match(/^[0-9a-fA-F]{24}$/))//Kiểm tra kí tự
            return res.status(200).json({ success: 0, message: "Post is not exist" });
        //Kiểm tra id_post có tồn tại không
        let check_id_post = await Post.findById(id_post);
        if (check_id_post) {
            ///kiểm tra list_post có tồn tại kg
            const save_post = await savePost.findOne({ id_user });
            if (save_post) { // đã có savePost
                let itemIndex = save_post.list_post.includes(id_post);
                if (itemIndex) {
                    //bài post đã lưu, thông báo
                    return res.status(200).json({ success: 0, message: "Before post was saved!" })
                } else {
                    //chưa  lưu, thêm vào
                    save_post.list_post.push(id_post);
                }
                const data = await save_post.save();
                //console.log(data);
                return res.status(200).json({ success: 1, message: "Saved success" });
            }
            else {//  chưa có savePost
                const newSavePost = new savePost({
                    id_user,
                    list_post: [
                        id_post
                    ]
                });
                //console.log(id_post);
                await newSavePost.save();
                res.status(200).json({ success: 1, message: "Saved success" });
            }
        }
        else {//id_post không tồn tại
            return res.status(200).json({ success: 0, message: "Post is not exist!" })
        }
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}


//Lấy danh sách list_post được lưu
//http://localhost:5000/save_post
function paginator(items, current_page, per_page_items) {
    let page = current_page || 1,
        per_page = per_page_items || 10,
        offset = (page - 1) * per_page,

        paginatedItems = items.slice(offset).slice(0, per_page_items),
        total_pages = Math.ceil(items.length / per_page);

    return {
        page: page,
        per_page: per_page,
        pre_page: page - 1 ? page - 1 : null,
        next_page: (total_pages > page) ? page + 1 : null,
        total: items.length,
        total_pages: total_pages,
        data: paginatedItems
    };
}

export const getAllPostInSavePost = async (req, res) => {
    try {
        console.log('GET ALL POST IN SAVE_POST');
        const id_user = req.userID;
        const save_post = await savePost.findOne({ id_user });
        if (!save_post) {//không có save_post
            return res.status(400).json({ success: 0, message: 'savePost not exit' })
        }
        else {
            if (save_post.list_post.length == 0) {
                return res.status(400).json({ success: 0, message: 'no post saved' })
            }
            else {
                const data = [];
                for (let temp of save_post.list_post) {
                    const post = await Post.findById(temp)//tìm bài post với id
                    //console.log(temp);
                    const InfoPost = {//thông tin cần lấy của mỗi bài post
                        "id_post": "",
                        "title": "",
                        "author": "",
                        "thumbnail_image": ""
                    }
                    const post_id_user = post.id_author;// lấy id_user của bài post lưu đó
                    //console.log(post_id_user)
                    const user = await User.findById(post_id_user)
                    const author = user.lastname.concat(" ", user.firstname) //lấy tên tác giả
                    InfoPost.author = author;
                    InfoPost.id_post = temp;
                    InfoPost.title = post.title; //lấy tiêu đề
                    InfoPost.thumbnail_image = post.thumbnail_image;//lấy ảnh của bài post
                    data.push(InfoPost);
                }
                //console.log(data);
                //pagination cho savePost
                //check limit and page
                const current_page = parseInt(req.query.page) || CURRENT_PAGE_DEFAULT;
                const per_page = parseInt(req.query.limit) || LIMIT_OF_POST_DEFAULT;

                if ((req.query.page && !Number.isFinite(parseInt(req.query.page))) || (req.query.limit && !Number.isFinite(parseInt(req.query.limit))))
                    return res.status(200).json({ success: 0, message: "limit and page must be a Number" })

                if ((req.query.page && parseInt(req.query.page) < 0) || (req.query.limit && parseInt(req.query.limit) < 0))
                    return res.status(200).json({ success: 0, message: "limit and page must greater than 0" })
                const saved_post = paginator(data, current_page, per_page)
                res.status(200).json({ success: 1, result: saved_post, message: "Success" });
            }
        }

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getSavedPostByUser = async (req, res) =>{
    try {
        console.log('GET ALL POST IN SAVE_POST OF ONE USER');
        const id_user = req.params;
        //console.log(id_user)
        const save_post = await savePost.findOne(id_user)
        //console.log(save_post)
        if (!save_post) {//không có save_post
            return res.status(400).json({ success: 0, message: 'savePost not exit' })
        }
        else {
            if (save_post.list_post.length == 0) {
                return res.status(400).json({ success: 0, message: 'no post saved' })
            }
            else {
                const data = [];
                for (let temp of save_post.list_post) {
                    const post = await Post.findById(temp)//tìm bài post với id
                    //console.log(temp);
                    const InfoPost = {//thông tin cần lấy của mỗi bài post
                        "id_post": "",
                        "title": "",
                        "author": "",
                        "thumbnail_image": ""
                    }
                    const post_id_user = post.id_author;// lấy id_user của bài post lưu đó
                    //console.log(post_id_user)
                    const user = await User.findById(post_id_user)
                    const author = user.lastname.concat(" ", user.firstname) //lấy tên tác giả
                    InfoPost.author = author;
                    InfoPost.id_post = temp;
                    InfoPost.title = post.title; //lấy tiêu đề
                    InfoPost.thumbnail_image = post.thumbnail_image;//lấy ảnh của bài post
                    data.push(InfoPost);
                }
                //console.log(data);
                //pagination cho savePost
                //check limit and page
                const current_page = parseInt(req.query.page) || CURRENT_PAGE_DEFAULT;
                const per_page = parseInt(req.query.limit) || LIMIT_OF_POST_DEFAULT;

                if ((req.query.page && !Number.isFinite(parseInt(req.query.page))) || (req.query.limit && !Number.isFinite(parseInt(req.query.limit))))
                    return res.status(200).json({ success: 0, message: "limit and page must be a Number" })

                if ((req.query.page && parseInt(req.query.page) < 0) || (req.query.limit && parseInt(req.query.limit) < 0))
                    return res.status(200).json({ success: 0, message: "limit and page must greater than 0" })
                const saved_post = paginator(data, current_page, per_page)
                res.status(200).json({ success: 1, result: saved_post, message: "Success" });
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
        if (!id_post.match(/^[0-9a-fA-F]{24}$/))//Kiêm tra kí tự
            return res.status(200).json({ success: 0, message: "Post is not exist" });
        const checkpost = await Post.findById(id_post);
        if (checkpost) {

            await savePost.findOneAndUpdate({ id_user }, {
                $pull: {
                    list_post: id_post
                }
            }, { new: true });
            res.status(200).json({ success: 1, message: "Success" });
        }
        else {//id_post không tồn tại
            return res.status(200).json({ success: 0, message: "Post is not exist!" })

        }
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
        await savePost.findOneAndUpdate({ id_user }, {
            $pullAll: {
                list_post: list_post
            }
        }, { new: true });
        res.status(200).json({ success: 1, message: "Success" });
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//Xóa tất cả các bài viết đã lưu
//http://localhost:5000/save_post/all_unsaved
export const deleteAll_ListPostInSavePost = async (req, res) => {
    try {
        console.log('DELETE SAVEPOST');
        const id_user = req.userID;
        await savePost.findOneAndDelete({ id_user: id_user }, { useFindAndModify: true });
        res.status(200).json({ message: "Success" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}