import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";

import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'

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

app.use(express.urlencoded({ extended: false}))
app.use(cookieParser());
app.use(express.static('./public'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(5000, () => console.log('Listening to server 5000'))