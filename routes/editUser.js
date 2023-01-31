const express = require('express');
const router = express.Router();
const editUserCntroller = require('../controllers/editUserController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
    .put(verifyJWT , editUserCntroller.editUser)

module.exports = router;