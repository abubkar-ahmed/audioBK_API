const express = require('express');
const router = express.Router();
const purchasesController = require('../controllers/purchasesControlles');
const verifyJWT = require('../middleware/verifyJWT');
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require('../middleware/verifyRoles');
const notAdmin = require('../middleware/notAdmin')

router.route('/')
    .get(verifyJWT , purchasesController.getAllPurchase)
    .post(verifyJWT , notAdmin , purchasesController.makePurchases)

router.route('/getAll')
    .get(verifyJWT , verifyRoles(ROLES_LIST.Admin) , purchasesController.getAllPurchaseAndUsers)

module.exports = router ;