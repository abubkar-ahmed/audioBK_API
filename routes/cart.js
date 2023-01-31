const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyJWT = require('../middleware/verifyJWT');
const notAdmin = require('../middleware/notAdmin')

router.route('/')
    .get(verifyJWT , notAdmin , cartController.getAllItems)
    .post(verifyJWT , notAdmin , cartController.addToCart)
    .put(verifyJWT , notAdmin , cartController.updateCart)
    .delete(verifyJWT , notAdmin , cartController.clearAll)

    

module.exports = router ;