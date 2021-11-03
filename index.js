import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { createRequire } from 'module';

import savePostRoutes from './routes/savePost.js';
import reactionsRoutes from './routes/reactions.js';

const require = createRequire(import.meta.url);

import postRouters from './routes/post.js'

dotenv.config();
const app = express();
const CONNECTION_URL = process.env.URL_MONGODB_LOCAL;
const PORT = process.env.PORT || 5000;
const dbOptions = {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
}


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('./public'));

app.use('/post', postRouters);


mongoose.connect(CONNECTION_URL, dbOptions)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    })
    .catch((error) => {
        console.log(error.message)
});
