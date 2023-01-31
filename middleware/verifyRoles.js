const jwt = require('jsonwebtoken');
const User = require('../model/User');

const verifyRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        const rolesArray = [...allowedRoles];
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = authHeader.split(' ')[1];
        let currentUser;
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
        if(rolesArray.includes(currentUserDB?.roles?.Admin)){
            return next();
        }else{
            return res.status(401).json({
                'message' : 'You Are Not Authorized.'
            });
        }
    }
}

module.exports = verifyRoles