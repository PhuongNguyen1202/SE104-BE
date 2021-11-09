import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import cors from "cors";

import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import { createRequire } from 'module';

import savePostRoutes from './routes/savePost.js';
import reactionsRoutes from './routes/reactions.js';
import roleRoutes from './routes/role.js';

const require = createRequire(import.meta.url);

import postRouters from './routes/post.js'
import imgrerRouters from './routes/imgredients.js'

dotenv.config();
const app = express();

const connectDB = async () => {
    try{
        await mongoose.connect(`${process.env.DB_URL}`, {
            useNewUrlParser: true,
            useUnifiedTopology : true
        })

        console.log('MongoDB connected')
    } catch (err){
        console.log(err.message);
        process.exit(1)
    }
}

connectDB()

app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
const dbOptions = {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        //useCreateIndex: true,
        //useFindAndModify: false,
    }

app.use('/post', postRouters);
app.use('/imgredient', imgrerRouters);

app.use(express.urlencoded({ extended: false}))
app.use(cookieParser());
app.use(express.static('./public'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(5000, () => console.log('Listening to server 5000'))
app.use('/save_post', savePostRoutes);
app.use ('/reaction', reactionsRoutes);
app.use('/role', roleRoutes);


