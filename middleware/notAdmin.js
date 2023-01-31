const jwt = require('jsonwebtoken');
const User = require('../model/User');

const notAdmin = async (req, res , next) => {
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
    
    const currentUserDB = await User.findOne({username : currentUser}).exec();
    if(!currentUserDB) return res.sendStatus(401);

    if(currentUserDB.roles.Admin || currentUserDB.roles.MainAdmin){
        return res.sendStatus(401);
    }else{
        return next();
    }
}

module.exports = notAdmin