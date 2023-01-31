const User = require('../model/User');
const Product = require('../model/Product');
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

const getAllItems = async (req , res) => {
    const currentUser = getCurrentUser(req, res) ;
    const user = await User.findOne({username : currentUser}).exec();
    if(!user) return res.sendStatus(500);

    return res.status(200).json({
        cart : user.cart
    })
}

const addToCart = async (req , res) => {
    const currentUser = getCurrentUser(req, res) ;
    const {productId , quantity} = req.body;

    if(!productId || (quantity <= 0)) return res.sendStatus(400);
    const user = await User.findOne({username : currentUser}).exec();
    if(!user) return res.sendStatus(500);
    const product = await Product.findById(productId);
    if(!product) return res.sendStatus(400);

    try{
        const cart = user.cart.filter(e => {
            return e.productId === productId
        });

        if(cart.length > 0){
            user.cart.map(e => {
                if(e.productId === productId){
                    const newQuantity = e.quantity + quantity
                    e.quantity = newQuantity
                }
                return e ;
            })
        }else{
            user.cart.push({
                productId : productId,
                quantity : quantity,
                shippingCost : 50,
                vat : 15,
            })
        }
        user.markModified('cart');
        user.save();

        return res.status(201).json({
            cart : user.cart
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

const clearAll = async (req , res) => {
    const currentUser = getCurrentUser(req, res) ;
    try{
        const user = await User.findOne({username : currentUser}).exec();
        if(!user) return res.sendStatus(500);

        user.cart = [];
        user.markModified('cart');
        user.save();
        
        return res.sendStatus(201) ;
    }catch(err) {
        return res.sendStatus(500);
    }
}

const updateCart = async (req , res) => {
    const currentUser = getCurrentUser(req, res) ;
    const {productId , quantity} = req.body ;

    if(!productId) return res.sendStatus(400);

    try{
        const user = await User.findOne({username : currentUser}).exec();
        if(!user) return res.sendStatus(500);
        if(quantity === 0){
            
            const filterdResult = user.cart.filter(e => {
                return e.productId !== productId
            })
            user.cart = filterdResult ;
        }else if(quantity >= 1){
            user.cart.map(e => {
                if(e.productId === productId){
                    e.quantity = quantity
                }
                return e
            })
        }

        user.markModified('cart');
        user.save();

        return res.sendStatus(201) ;
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

module.exports = {
    getAllItems,
    addToCart,
    updateCart,
    clearAll
};