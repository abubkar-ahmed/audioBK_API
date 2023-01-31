const express = require('express');
const router = express.Router();
const authController = require('../controllers/loginControllers');

router.route('/')
    .post(authController.handleLogin)
    .put(authController.handleResetPwd)

module.exports = router ;