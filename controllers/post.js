'use strict';
import fs from 'fs';
import Post from '../models/post.js';
import PostDetail from '../models/post_detail.js';
import Ingredient from '../models/ingredients.js';
import likePost from '../models/reactions.js';
import savePost from "../models/savePost.js";



//Các function dùng để lưu ảnh
const DEFAULT_FOLDER_UPLOAD_IMAGE = './public/post/image';
const URL_HOST = 'http://localhost:5000/';
const LIMIT_OF_POST_DEFAULT = 20;
const CURRENT_PAGE_DEFAULT = 1;

const solvePathURL = path => {
    let new_path = path.split('/').slice(2).join('/');
    let full_path = URL_HOST + new_path;

    return full_path;
}

const saveImage = (folder, nameImage, base64) => {
    const type = base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
    const base64_replace = base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const path = folder + '/' + nameImage + '.' + type;

    fs.writeFileSync(path, base64_replace, 'base64');

    const full_path = solvePathURL(path);
    return full_path;
}

//bỏ dấu tiếng việt
const removeVietnameseTones = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
}

//thêm step cho directions
const makeDirections = (count_directions, directions) => {
    let arr_directions = [];

    for (let i = 0; i < count_directions; i++) {
        let temp = {
            step: i + 1,
            description: directions[i]
        };
        arr_directions.push(temp);
    }
    return arr_directions;
}
const arrIngredient = (getListIngredient) => {
    let arr = [];
    getListIngredient.forEach(e => {
        arr.push(e.name);
    });
    return arr;
}
//Thêm bài viết
export const addPost = async (req, res) => {
    try {
        let getListIngredient = await Ingredient.find();
        let arrListIngre = arrIngredient(getListIngredient);
        let check
        //console.log(arrListIngre);

        //check login
        if (!req.userID)
            return res.status(200).json({ status: 0, message: "You need login" })

        let id_user = req.userID;
        let data = req.body;
        // Kiểm tra tính hợp lệ của dữ liệu
        //kiểm tra dữ liệu rỗng
        if (!data.title || !data.description || !data.ingredients || !data.thumbnail_image || !data.directions) {
            res.status(200).json({ status: 0, message: 'Invalid information: the title, description, ingredients, thumbnail_image fields blank are not NULL' })
        }
        else {
            if (data.ingredients.length === 0 || data.directions.length === 0)
                return res.status(200).json({ status: 0, message: 'Invalid information: the title, description, ingredients, thumbnail_image fields blank are not empty' })

            //Kiểm tra hình phải là base64
            //console.log("Add...................")
            const base64_replace = data.thumbnail_image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
            const isBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            let check = isBase64.test(base64_replace);
            //console.log(check);
            if (!check) return res.status(200).json({ status: 0, message: "Invalid Image" })

            //thêm mới post với các trường hình ảnh null
            let ingredients = data.ingredients;
            let newIngredient;

            let index_ingredients = "";
            ingredients.forEach(ingredient => {
                let removeVNTones_ingredient = removeVietnameseTones(ingredient.name);
                index_ingredients = removeVNTones_ingredient + " " + index_ingredients;
                if (!arrListIngre.includes(ingredient.name)) {
                    newIngredient = new Ingredient({
                        name: ingredient.name,
                        index_name: removeVNTones_ingredient
                    })
                    newIngredient.save();
                    console.log('save Ingredient')
                }
            });

            let newPost = new Post({
                title: data.title,
                ingredients: data.ingredients,
                id_author: id_user,
                index_title: removeVietnameseTones(data.title),
                index_ingredients: index_ingredients,
                thumbnail_image: ""
            })
            //tiến hành lưu thumbnail_image
            let thumbnail_name = newPost._id + '_thumnail_image';
            let thumbnail_image = await saveImage(DEFAULT_FOLDER_UPLOAD_IMAGE, thumbnail_name, data.thumbnail_image);
            newPost.thumbnail_image = thumbnail_image;
            await newPost.save();

            //Lưu post_detail
            //console.log(data.directions);
            let count_directions = data.directions.length;
            //console.log(count_directions);
            let directions = makeDirections(count_directions, data.directions);
            const newPostDetail = new PostDetail({
                id_post: newPost._id,
                description: data.description,
                directions: directions,
                count_directions: count_directions
            })
            await newPostDetail.save()

            res.status(200).json({ status: 1, message: "Add Success" })
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Lấy danh sách toàn bộ bài viết
export const getAllPost = async (req, res) => {
    try {
        //check limit and page
        const current_page = parseInt(req.query.page) || CURRENT_PAGE_DEFAULT;
        const per_page = parseInt(req.query.limit) || LIMIT_OF_POST_DEFAULT;

        if ((req.query.page && !Number.isFinite(parseInt(req.query.page))) || (req.query.limit && !Number.isFinite(parseInt(req.query.limit))))
            return res.status(200).json({ status: 0, message: "limit and page must be a Number" })

        if ((req.query.page && parseInt(req.query.page) < 0) || (req.query.limit && parseInt(req.query.limit) < 0))
            return res.status(200).json({ status: 0, message: "limit and page must greater than 0" })

        let natural;
        const query = req.query.q;
        if (query == 'new')
            natural = -1;
        else natural = 1;
        //console.log(natural)
        const all_post = await Post.find();
        let list_post = await Post.find()
            .sort({ $natural: natural })
            .populate({
                path: 'id_author',
                select: 'firstname lastname avatar'
            })
            .limit(per_page)
            .skip(per_page * (current_page - 1))

        let save_post
        if (req.userID) {
            //console.log(req.userID)
            save_post = await savePost.findOne({ id_user: req.userID });
        }

        //like post
        let temp;
        for (let post of list_post) {
            temp = await likePost.findOne({ id_post: post._id })
            if (temp) {
                post._doc.numberLike = temp.list_user.length;
                //user like post

                if (req.userID && temp.list_user.indexOf(req.userID) != -1) {
                    post._doc.isLike = true;
                }
                else post._doc.isLike = false
            }
            else {
                post._doc.isLike = false;
                post._doc.numberLike = 0;
            }

            if (save_post && save_post.list_post.indexOf(post._id) != -1)
                post._doc.isSaved = true;
            else post._doc.isSaved = false;
        }

        const total = all_post.length;
        let from = 0;
        let to = 0;
        if ((current_page - 1) * per_page + 1 <= total) {
            from = (current_page - 1) * per_page + 1;
            to = from + list_post.length - 1;
        }
        else {
            from = to = 0
        }
        let paging = {
            "current_page": current_page,
            "limit": per_page,
            "from": from,
            "to": to,
            "total": total
        }
        if (natural === -1) paging.filter = "new"
        else paging.query = "default"
        res.status(200).json({ status:1, data: list_post, paging: paging, message: "Success" });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const populatedPost = [
    "_id",
    "title",
    "ingredients",
    "id_author",
    "createdAt",
    "updateAt",
    "thumbnail_image",
    "description",
    "directions",
    "count_directions"
]
// Xem thông tin chi tiết từng bài viết
export const getPostById = async (req, res) => {
    try {
        let id = req.params.id;
        if (!id.match(/^[0-9a-fA-F]{24}$/))
            return res.status(200).json({ status: 0, message: "Post is not exist" });
        const post = await Post.findById(id)
            .populate({
                path: 'id_author',
                select: 'firstname lastname avatar'
            })
        const reacts = await likePost.findOne({ id_post: id })
        if (post !== null) {
            const detail_post = await PostDetail.findOne({ id_post: id })
            //console.log(detail_post);
            let data = {};
            for (let temp of populatedPost) {
                if (temp in post)
                    data[temp] = post[temp]
                else {
                    if (temp in detail_post)
                        data[temp] = detail_post[temp];
                }
            }
            if (reacts && req.userID && reacts.list_user.indexOf(req.userID) != -1) {
                data.numberLike = reacts.list_user.length;
                data.isLike = true;
            }
            else if (reacts) {
                data.numberLike = reacts.list_user.length;
                data.isLike = false;
            }
            else {
                data.numberLike = 0;
                data.isLike = false;
            }
            //check saved
            if (req.userID) {
                let save_post = await savePost.findOne({ id_user: req.userID })
                if (save_post && save_post.list_post.indexOf(id) != -1) data.isSaved = true
            }
            else data.isSaved = false
            res.status(200).json({ status:1, data, message: "Success" });
        }
        else res.status(200).json({ message: "Post not exist" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Lấy danh sách các bài viết của 1 user
export const getPostByIdUser = async (req, res) => {
    try {
        let id_user = req.userID;
        //console.log(id_user);

        const current_page = parseInt(req.query.page) || CURRENT_PAGE_DEFAULT;
        const per_page = parseInt(req.query.limit) || LIMIT_OF_POST_DEFAULT;

        if ((req.query.page && !Number.isFinite(parseInt(req.query.page))) || (req.query.limit && !Number.isFinite(parseInt(req.query.limit))))
            return res.status(200).json({ status: 0, message: "limit and page must be a Number" });

        if ((req.query.page && parseInt(req.query.page) < 0) || (req.query.limit && parseInt(req.query.limit) < 0))
            return res.status(200).json({ status: 0, message: "limit and page must greater than 0" });
        
        const all_post = await Post.find({id_author: id_user});

        let posts = await Post.find({ id_author: id_user })
            .populate({
                path: 'id_author',
                select: 'firstname lastname avatar'
            })
            .limit(per_page)
            .skip(per_page * (current_page - 1));

        //get list saved post
        let save_post
        if (req.userID) {
            //console.log(req.userID)
            save_post = await savePost.findOne({ id_user: req.userID });
        }

        let temp;
        for (let post of posts) {
            temp = await likePost.findOne({ id_post: post._id })
            if (temp) {
                post._doc.numberLike = temp.list_user.length;
                //user like post

                if (req.userID && temp.list_user.indexOf(req.userID) != -1) {
                    post._doc.isLike = true;
                }
                else post._doc.isLike = false
            }
            else {
                post._doc.isLike = false;
                post._doc.numberLike = 0;
            }
            //check save_post
            if (save_post && save_post.list_post.indexOf(post._id) != -1)
                post._doc.isSaved = true;
            else post._doc.isSaved = false;
        }

        const total = all_post.length;
        let from = 0;
        let to = 0;
        if ((current_page - 1) * per_page + 1 <= total) {
            from = (current_page - 1) * per_page + 1;
            to = from + posts.length - 1;
        }
        else {
            from = to = 0
        }
        let paging = {
            "current_page": current_page,
            "limit": per_page,
            "from": from,
            "to": to,
            "total": total
        }
        res.status(200).json({ status:1, data: posts, paging: paging, message: "Success" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


//update bài viết
export const updatePost = async (req, res) => {
    try {
        let data = req.body;
        if (!data.title || !data.description || !data.ingredients || !data.thumbnail_image || !data.directions)
            return res.status(200).json({ message: "Invalid information: the title, description, ingredients, thumbnail_image fields blank are not NULL" });
        if (data.ingredients.length === 0 || data.directions.length === 0)
            return res.status(200).json({ status: 0, message: 'Invalid information: the title, description, ingredients, thumbnail_image fields blank are not empty' })
        let id_post = req.params.id;
        //check id_post
        if (!id_post.match(/^[0-9a-fA-F]{24}$/))
            return res.status(200).json({ status: 0, message: "Post is not exist" });
        const post = await Post.findById(id_post);
        if (!post)
            return res.status(400).json({ status: 0, message: "Post is not exist" });

        const base64_replace = data.thumbnail_image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        const isBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        let check = isBase64.test(base64_replace);
        //console.log(check);
        //Check thumbnail image
        const thumbnail_default = 'http://localhost:5000/post/image/' + id_post + '_thumnail_image';
        if (!check) {
            let check_thumbnail = data.thumbnail_image.split('.')[0]
            //console.log(check_thumbnail);
            if (check_thumbnail != thumbnail_default)
                return res.status(200).json({ status: 0, message: "Invalide Image" })
        }
        let thumbnail_image = data.thumbnail_image;
        if (check) {
            let thumbnail_name = id_post + '_thumnail_image';
            thumbnail_image = await saveImage(DEFAULT_FOLDER_UPLOAD_IMAGE, thumbnail_name, data.thumbnail_image);
            console.log('update image')
        }

        let ingredients = data.ingredients;
        let index_ingredients = "";
        ingredients.forEach(ingredient => {
            let removeVNTones_ingredient = removeVietnameseTones(ingredient.name);
            index_ingredients = removeVNTones_ingredient + " " + index_ingredients;
        });
        const updatePost = {
            title: data.title,
            ingredients: data.ingredients,
            thumbnail_image: thumbnail_image,
            index_title: removeVietnameseTones(data.title),
            index_ingredients: index_ingredients,
            updateAt: Date.now()
        }
        let count_directions = data.directions.length;
        let directions = makeDirections(count_directions, data.directions);
        const updateDetailPost = {
            description: data.description,
            directions: directions,
            count_directions: count_directions
        }

        //update
        await Post.findByIdAndUpdate(id_post, updatePost, { useFindAndModify: true });
        await PostDetail.findOneAndUpdate({ id_post }, updateDetailPost, { useFindAndModify: true });
        res.status(200).json({ status: 0, message: "Update Success" })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


//xóa bài viết
export const deletePostById = async (req, res) => {
    try {
        let id_post = req.params.id;
        //check id_post
        if (!id_post.match(/^[0-9a-fA-F]{24}$/))
            return res.status(200).json({ status: 0, message: "Post is not exist" });

        const post = await Post.findOne({ _id: id_post, id_author: req.userID });

        //console.log(save_post)
        if (!post)
            return res.status(200).json({ status: 0, message: "Post is not exist" })
        await Post.findByIdAndDelete(id_post, { useFindAndModify: true })
        await PostDetail.findOneAndDelete({ id_post }, { useFindAndModify: true });
        const nameImage = post.thumbnail_image.split('/')
        //console.log(nameImage[5]);
        //Delete like of post
        await likePost.findOneAndRemove({ id_post }, { useFindAndModify: true })

        //delete save post
        const save_post = await savePost.updateMany({ list_post: id_post }, {
            $pull: { list_post: id_post }
        }, { useFindAndModify: true });

        fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + nameImage[5], function (err) {
            if (err) console.error(err);
            console.log('File has been Deleted');
        })
        res.status(200).json({ status: 1, message: "Delete Success" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteManyPost = async (req, res) => {
    try {
        const list_post_delete = req.body.list_post;
        const save_post = await savePost.updateMany({
            id_post:
                { $in: list_post_delete }
        }, {
            $pull: {
                list_post:
                    { $in: list_post_delete }
            }
        }, { useFindAndModify: true });
        //console.log(save_post)

        let nameImage;

        if (list_post_delete.length === 0)
            return res.status(200).json({ status: 0, message: "You must choose the post to delete" })
        //get list thumnail image
        const list_post = await Post.find({
            _id: {
                $in: list_post_delete
            },
            id_author: req.userID
        })

        //Delete Post
        const delete_success = await Post.deleteMany({
            _id: {
                $in: list_post_delete
            },
            id_author: req.userID
        }, { useFindAndModify: true })
        //console.log(delete_success.deletedCount);
        if (delete_success.deletedCount === 0)
            return res.status(200).json({ status: 0, message: "Delete faile" })
        //Delete Detail
        await PostDetail.deleteMany({
            id_post: {
                $in: list_post_delete
            }
        }, { useFindAndModify: true })
        //Delete like
        await likePost.deleteMany({
            id_post: {
                $in: list_post_delete
            }
        }, { useFindAndModify: true })

        //Delete image
        list_post.forEach(post => {
            nameImage = post.thumbnail_image.split('/')
            fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + nameImage[5], function (err) {
                if (err) console.error(err);
                console.log('File has been Deleted');
            })
        });
        res.status(200).json({ status: 1, message: "Delete Success" })
    } catch (error) {
        res.status(400).json({ message: message.error })
    }
}

export const deleteAllPostByIdUser = async (req, res) => {
    try {
        const user_id = req.userID;
        const list_post = await Post.find({ id_author: user_id });
        //console.log(list_post)
        if (list_post.length === 0)
            return res.status(200).json({ status: 0, message: "User dosen't have any post" });
        let thumbnail_name = [];
        let list_id_post = [];
        list_post.forEach(post => {
            let temp = post.thumbnail_image.split('/');
            thumbnail_name.push(temp[5]);
            list_id_post.push(post._id);
        });
        //delete post
        await Post.deleteMany({ id_author: user_id }, { useFindAndModify: true })
        //delete detail
        await PostDetail.deleteMany({ id_post: { $in: list_id_post } }, { useFindAndModify: true })
        //delete id in save post
        const save_post = await savePost.updateMany({
            id_post:
                { $in: list_id_post }
        }, {
            $pull: {
                list_post:
                    { $in: list_id_post }
            }
        }, { useFindAndModify: true });
        console.log(save_post)
        //delete like
        await likePost.deleteMany({
            id_post: {
                $in: list_id_post
            }
        }, { useFindAndModify: true })
        //delete image
        thumbnail_name.forEach(e => {
            fs.unlink(DEFAULT_FOLDER_UPLOAD_IMAGE + '/' + e, function (err) {
                if (err) console.error(err);
                console.log('File has been Deleted');
            })
        });
        res.status(200).json({ status: 1, message: "Delete Success" })
    } catch (error) {
        res.status(400).json({ message: message.error })
    }
}

export const randomPost = async (req, res) => {
    try {
        const random = await Post.aggregate([{ $sample: { size: 1 } }])
        const data = await Post.findById(random[0]._id)
            .populate({
                path: 'id_author',
                select: 'firstname lastname avatar'
            });
        //console.log(random)
        res.status(200).json({ status: 1, data: data, message: "Success" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const searchPost = async (req, res) => {
    try {
        let paging, all_post, data, save_post;
        const limit = parseInt(req.query.limit) || LIMIT_OF_POST_DEFAULT;
        const current_page = req.query.page || CURRENT_PAGE_DEFAULT;

        if ((req.query.page && !Number.isFinite(parseInt(req.query.page))) || (req.query.limit && !Number.isFinite(parseInt(req.query.limit))))
            return res.status(200).json({ status: 0, message: "limit and page must be a Number" })

        if ((req.query.page && parseInt(req.query.page) < 0) || (req.query.limit && parseInt(req.query.limit) < 0))
            return res.status(200).json({ status: 0, message: "limit and page must greater than 0" })
        //console.log("Search")
        const query = req.query.q;
        //console.log(query)
        if (query) {
            all_post = await Post.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } })

            data = await Post.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } })
                .populate({
                    path: 'id_author',
                    select: 'firstname lastname avatar'
                })
                .limit(limit)
                .skip(limit * (current_page - 1))
            if (req.userID) {
                //console.log(req.userID)
                save_post = await savePost.findOne({ id_user: req.userID });
                //console.log()
            }

            //like post
            let temp;
            for (let post of data) {
                temp = await likePost.findOne({ id_post: post._id })
                if (temp) {
                    post._doc.numberLike = temp.list_user.length;
                    //user like post

                    if (req.userID && temp.list_user.indexOf(req.userID) != -1) {
                        post._doc.isLike = true;
                    }
                    else post._doc.isLike = false
                }
                else {
                    post._doc.isLike = false;
                    post._doc.numberLike = 0;
                }

                if (save_post && save_post.list_post.indexOf(post._id) != -1)
                    post._doc.isSaved = true;
                else post._doc.isSaved = false;
            }

            const total = all_post.length;
            let from = 0;
            let to = 0;
            if ((current_page - 1) * limit + 1 <= total) {
                from = (current_page - 1) * limit + 1;
                to = from + data.length - 1;
            }
            else {
                from = to = 0
            }
            paging = {
                "current_page": current_page,
                "limit": limit,
                "from": from,
                "to": to,
                "total": total
            }
            //console.log(data);
        }
        else {
            all_post = await Post.find();
            data = await Post.find()
                .populate({
                    path: 'id_author',
                    select: 'firstname lastname avatar'
                })
                .limit(limit)
                .skip(limit * (current_page - 1))

            if (req.userID) {
                //console.log(req.userID)
                save_post = await savePost.findOne({ id_user: req.userID });
            }

            //like post
            let temp;
            for (let post of data) {
                temp = await likePost.findOne({ id_post: post._id })
                if (temp) {
                    post._doc.numberLike = temp.list_user.length;
                    //user like post

                    if (req.userID && temp.list_user.indexOf(req.userID) != -1) {
                        post._doc.isLike = true;
                    }
                    else post._doc.isLike = false
                }
                else {
                    post._doc.isLike = false;
                    post._doc.numberLike = 0;
                }

                if (save_post && save_post.list_post.indexOf(post._id) != -1)
                    post._doc.isSaved = true;
                else post._doc.isSaved = false;
            }

            const total = all_post.length;
            let from = 0;
            let to = 0;
            if ((current_page - 1) * limit + 1 <= total) {
                from = (current_page - 1) * limit + 1;
                to = from + data.length - 1;
            }
            else {
                from = to = 0
            }
            paging = {
                "current_page": current_page,
                "limit": limit,
                "from": from,
                "to": to,
                "total": total
            }
        }
        res.status(200).json({ status: 1, data: data, paging: paging, message: "success" })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

