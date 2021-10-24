'use strict';
import fs from 'fs';
import Post from '../models/post.js';
import PostDetail from '../models/post_detail.js';


//Các function dùng để lưu ảnh
const DEFAULT_FOLDER_UPLOAD_IMAGE = './public/post/image';
const URL_HOST = 'http://localhost:5000/'

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

//Thêm bài viết
export const addPost = async (req, res) => {
    try {

        let data = req.body;
        // Kiểm tra tính hợp lệ của dữ liệu
        if (!data.title || !data.description || !data.ingredients || !data.id_user || !data.thumbnail_image || !data.directions) {
            res.status(200).json({ status: 0, message: 'Invalid information: the title, description, ingredients, thumbnail_image fields blank are not NULL' })
        }
        else {
            if (data.ingredients.length === 0 || data.directions.length === 0)
                return res.status(200).json({ status: 0, message: 'Invalid information: the title, description, ingredients, thumbnail_image fields blank are not empty' })
            //thêm mới post với các trường hình ảnh null
            let ingredients = data.ingredients;
            let index_ingredients = [];
            ingredients.forEach(ingredient => {
                let removeVNTones_ingredient = removeVietnameseTones(ingredient.name);
                index_ingredients.push(removeVNTones_ingredient);
            });

            let newPost = new Post({
                title: data.title,
                ingredients: data.ingredients,
                id_user: data.id_user,
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

            res.status(200).json({ message: "Success" })
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Lấy danh sách toàn bộ bài viết
export const getAllPost = async (req, res) => {
    try {
        const all_post = await Post.find();
        res.status(200).json({ data: all_post, message: "Success" });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const populatedPost = [
    "_id",
    "title",
    "ingredients",
    "id_user",
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
        const post = await Post.findById(id);
        if (post !== null) {
            const detail_post = await PostDetail.findOne({ id_post: id })
            console.log(detail_post);
            let data = {};
            for (let temp of populatedPost) {
                if (temp in post)
                    data[temp] = post[temp]
                else {
                    if (temp in detail_post)
                        data[temp] = detail_post[temp];
                }
            }
            res.status(200).json({ data, message: "Success" });
        }
        else res.status(200).join({ message: "Post not exist" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//Lấy danh sách các bài viết của 1 user
export const getPostByIdUser = async (req, res) => {
    try {
        let id_user = req.params.id_user;
        //console.log(id_user);
        const posts = await Post.find({ id_user: id_user });
        if (posts !== null)
            res.status(200).json({ data: posts, message: "Success" })
        else res.status(200).json({ message: "user not have post yet" })
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
        const post = await Post.findById(id_post);
        if (!post)
            return res.status(400).json({ message: "Post is not exist" });

        const base64_replace = data.thumbnail_image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
        const isBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        let check = isBase64.test(base64_replace);
        console.log(check);
        let thumbnail_image = data.thumbnail_image;
        if (check) {
            let thumbnail_name = id_post + '_thumnail_image';
            thumbnail_image = await saveImage(DEFAULT_FOLDER_UPLOAD_IMAGE, thumbnail_name, data.thumbnail_image);
            console.log('update image')
        }

        let ingredients = data.ingredients;
        let index_ingredients = [];
        ingredients.forEach(ingredient => {
            let removeVNTones_ingredient = removeVietnameseTones(ingredient.name);
            index_ingredients.push(removeVNTones_ingredient);
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
        res.status(200).json({ message: "Success" })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//xóa bài viết
export const deletePostById = async (req, res) => {
    try {
        let id_post = req.params.id;
        const post = await Post.findById(id_post);
        if (!post)
            return res.status(200).json({ message: "Post is not exist" })
        await Post.findByIdAndDelete(id_post, { useFindAndModify: true })
        await PostDetail.findOneAndDelete({ id_post }, { useFindAndModify: true });
        res.status(200).json({ message: "Success" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

//ramdom
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

export const randomPost = async (req, res) => {
    try {
        const random = await Post.aggregate([{ $sample: {size: 1}}]);
        console.log(random)
        res.status(200).json({ data: random, message: "Success" });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
