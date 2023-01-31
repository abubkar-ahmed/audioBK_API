const allowedOrigns = require('../config/allowedOrigns');

const credentials = (req , res , next) => {
    const orign = req.headers.origin;
    if(allowedOrigns.includes(orign)){
        res.header('Access-Control-Allow-Credentials', true)
    }
    next();
}

module.exports = credentials