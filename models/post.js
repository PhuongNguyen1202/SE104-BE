import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
title: {
    type: String
},
ingredients: [Object]
,
id_user:{
    type: String,
    require: true
},
createdAt:{
    type: Date,
    default: Date.now(),
},
updateAt: {
    type: Date,
    default: null,
},
thumbnail_image: {
    type: String,
},
index_title: String,
index_ingredients: [String]
})
const Post = mongoose.model('posts', postSchema);

export default Post;