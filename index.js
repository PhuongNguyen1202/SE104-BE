import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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


mongoose.connect(CONNECTION_URL, dbOptions)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    })
    .catch((error) => {
        console.log(error.message)
});
