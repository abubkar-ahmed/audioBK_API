const nodemailer = require('nodemailer');
const User = require('../model/User')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const byteSize = require('byte-size');
const jwt = require('jsonwebtoken');

const getCurrentUser = async (req , res) => {
    let currentUser ;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403);
            currentUser = decoded.username ;
        }
    ); 
    return currentUser ;
}

const editUser = async (req , res) => {
    const currentUser = await getCurrentUser(req, res) ;
    const {pwd , rPwd} = req?.body;
    try{
        const user = await User.findOne({username : currentUser}).exec()
        if(!user) return res.sendStatus(500);

        if(req?.files?.img){
            const acceptedType = ['image/png', 'image/jpg', 'image/jpeg' , 'image/webp'] ;
            const img = req.files.img ;
            if(!acceptedType.includes(img?.mimetype)) {
                return res.status(400).json({
                    'message' : 'invalied Image Type'
                })
            }
            const size = byteSize(img.size);

            if(size.unit === 'MB' && size.value > 5){
                return res.status(400).json({
                    'message' : 'Max Size For Image Is 5MB'
                })
            }
            if(size.unit === 'kB' || size.unit === 'MB'){
                user.img = new Buffer.from(img.data, "base64");
                user.imgType = img.mimetype;
            }else {
                return res.status(400).json({
                    'message' : 'Max Size For Image Is 5MB'
                })
            }
        }
        if(pwd && rPwd){
            if(pwd !== rPwd) return res.status(409).json({
                'message' : 'Password Must Be same As Repeated Password'
            })
            console.log(pwd.length)
            if(pwd.length <= 5) return res.status(409).json({
                'message' : 'Password Must Be 6 Char Or More'
            })
            const hashPassword = await bcrypt.hash(pwd , 10);

            user.password = pwd ;
            
        }

        const result = await user.save();

        return res.sendStatus(201);

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

module.exports = {
    editUser
}