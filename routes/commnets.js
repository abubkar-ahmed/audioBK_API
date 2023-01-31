const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentsController');
const verifyJWT = require('../middleware/verifyJWT');

// Adding our Updating a comment
router.route('/')
    .post(verifyJWT , commentController.addNewComment)
    .put(verifyJWT , commentController.updateComment)

// get all comment of a product
router.route('/:productId')
    .get(commentController.getCommentOfProduct)

// like a certian comment
router.route('/:commentId/:productId')
    .post(verifyJWT , commentController.likeComment)

// delete comment
router.route('/:productId/:commentId')
    .delete(verifyJWT , commentController.deleteComment)



module.exports = router ;