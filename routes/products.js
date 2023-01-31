const express = require('express');
const router = express.Router();
const productCntroller = require('../controllers/ProductController');
const verifyJWT = require('../middleware/verifyJWT');
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require('../middleware/verifyRoles');

router.route('/')
    .get(productCntroller.getAllProducts)
    .post(verifyJWT, verifyRoles(ROLES_LIST.Admin),productCntroller.addNewProducts)
    .put(verifyJWT, verifyRoles(ROLES_LIST.Admin),productCntroller.updateProduct)

router.route('/:id')
    .delete(verifyJWT, verifyRoles(ROLES_LIST.MainAdmin),productCntroller.deleteProduct)
    

module.exports = router;