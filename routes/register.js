const express = require('express');
const router = express.Router();
const registerCntroller = require('../controllers/registerController');

// router.post('/', registerCntroller.handleNewUser);
router.route('/')
    .post(registerCntroller.handleNewUser)
    .put(registerCntroller.handleVerificationStatus)

module.exports = router;