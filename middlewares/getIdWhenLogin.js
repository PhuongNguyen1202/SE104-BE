import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const getIdLogin = (req, res, next) => {

  const bearerHearder = req.headers['authorization'];
  if (!bearerHearder) 
    return res.status(403).send({ auth: false, message: 'No token provided.' });

  const bearer = bearerHearder.split(' ');
  const token = bearer[1];
    if (token) 
    {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {      
            if (err) 
              return res.status(500).send({ auth: false, message: err.message });    
            req.userID = data.userID;
            next()
          });
    }
    else next()
  }