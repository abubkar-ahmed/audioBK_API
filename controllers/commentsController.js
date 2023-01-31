const Product = require('../model/Product');
const User = require('../model/User');
const {v4:uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');

const getCurrentUser = (req , res) => {
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

    return currentUser ;
}

const allUsers = async () => {
    const Users = await User.find();
    // console.log(Users)
    if(Users){
        const finalUsers = Users.map(e => {
            return {
                createdBy : e.username,
                image : e.userImgPath ? e.userImgPath : null
            }
        })
        return finalUsers
    }else{
        return null
    }

}

const getCommentOfProduct = async (req , res) => {
    const {productId} = req.params;
    if(!productId) return res.sendStatus(400);

    let users ; 
    await allUsers().then(e => {
        users = e ;
    })
    
    const commentsOfProduct = await Product.findById(productId) ;
    if(!commentsOfProduct) return res.status(400).json({
        'message' : 'Please Enter Valied Product Id'
    })
    return res.status(200).json({
        comments : commentsOfProduct.comments.map(e => {
            const createdBy =  users.filter(h => {
                return e.createdBy === h.createdBy
            });
            
            return {
                comment : e.comment,
                date : e.date ,
                likes : e.likes,
                createdBy : createdBy[0],
                id : e.id
            }
        })
    })

}

const addNewComment = async (req , res) => {
    const currentUser = getCurrentUser(req, res) ;

    const {comment , productId} = req.body;

    if(!comment || !productId) return res.sendStatus(400);

    let users ; 
    await allUsers().then(e => {
        users = e ;
    })

    try{
        const newComment = await Product.findById(productId).exec();
        if(!newComment) return res.status(400).json({
            'massage' : 'Please Add A valied Product Id'
        });

        const time = new Date().toLocaleDateString('en-us', { 
            year:"numeric",
            month:"numeric",
            day:"numeric",
            hour : 'numeric',
            minute: "numeric",
            second : 'numeric'
        });

        const finalCommentObj = {
            comment : comment,
            createdBy : currentUser,
            date : new Date()
        }

        newComment.comments.push(finalCommentObj);

        const result = await newComment.save();


        return res.status(201).json({
            comments : result.comments.map(e => {
                const createdBy =  users.filter(h => {
                    return e.createdBy === h.createdBy
                });
                
                return {
                    comment : e.comment,
                    date : e.date ,
                    likes : e.likes,
                    createdBy : createdBy[0],
                    id : e.id
                }
            })
        })
        
    }catch(err){
        console.log(err)
        return res.sendStatus(500);
    }

}

const updateComment = async (req , res) => {
    const currentUser = getCurrentUser(req, res);
    const {comment , productId , commentId} = req.body;

    if(!comment || !productId || !commentId) return res.sendStatus(400);
    
    let users ; 
    await allUsers().then(e => {
        users = e ;
    })

    try{
        const updateProduct = await Product.findById(productId);
        if(!updateProduct) return res.status(400).json({
            'massage' : 'Please Add A valied Product Id'
        });


        for(let i = 0 ; i < updateProduct.comments.length ; i++){
            if(updateProduct.comments[i].id === commentId){
                const theComment = updateProduct.comments[i];
                if(theComment.createdBy !== currentUser) return res.sendStatus(401);

                updateProduct.comments[i].comment = await comment;

            }
        }
        const result = await updateProduct.save();
        return res.status(201).json({
            comments : result.comments.map(e => {
                const createdBy =  users.filter(h => {
                    return e.createdBy === h.createdBy
                });
                
                return {
                    comment : e.comment,
                    date : e.date ,
                    likes : e.likes,
                    createdBy : createdBy[0],
                    id : e.id
                }
            })
        })

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}


const deleteComment = async (req , res) => {
    const currentUser = getCurrentUser(req, res);
    const {productId , commentId} = req.params;


    if(!productId || !commentId) return res.sendStatus(400);

    let users ; 
    await allUsers().then(e => {
        users = e ;
    })

    try{
        const updateProduct = await Product.findById(productId);

        if(!updateProduct) return res.status(400).json({
            'massage' : 'Please Add A valied Product Id'
        });

        let unAuth = false ;

        const filterdComments = updateProduct.comments.filter(e => {
            if(e.id === commentId && e.createdBy !== currentUser){
                unAuth = true
            }
            return e.id !== commentId
        })
        if(!unAuth){
            updateProduct.comments = filterdComments ;
        }else{
            return res.sendStatus(401);
        }
        
        const result = await updateProduct.save();

        return res.status(201).json({
            comments : result.comments.map(e => {
                const createdBy =  users.filter(h => {
                    return e.createdBy === h.createdBy
                });
                
                return {
                    comment : e.comment,
                    date : e.date ,
                    likes : e.likes,
                    createdBy : createdBy[0],
                    id : e.id
                }
            })
        })


    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}


const likeComment = async (req , res) => {
    const currentUser = getCurrentUser(req, res);
    const {commentId , productId} = req.params ;

    let users ; 
    await allUsers().then(e => {
        users = e ;
    })

    try{
        const likeProduct = await Product.findById(productId);
        if(!likeProduct) return res.sendStatus(400);

        for(let i = 0 ; i < likeProduct.comments.length ; i++){
            if(likeProduct.comments[i].id === commentId){
                const likes = likeProduct.comments[i].likes;

                if(likes.includes(currentUser)) return res.status(400).json({
                    'message' : 'already Liked'
                })

                likeProduct.comments[i].likes.push(currentUser)
            }
        }
        const result = await likeProduct.save();


        // console.log(result)
        return res.status(201).json({
            comments : result.comments.map(e => {
                const createdBy =  users.filter(h => {
                    return e.createdBy === h.createdBy
                });
                
                return {
                    comment : e.comment,
                    date : e.date ,
                    likes : e.likes,
                    createdBy : createdBy[0],
                    id : e.id
                }
            })
        })

    }catch(err) {
        console.log(err)
        return res.sendStatus(500)
    }


}

module.exports = {
    getCommentOfProduct,
    addNewComment,
    updateComment, 
    deleteComment,
    likeComment
}