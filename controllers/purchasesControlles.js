const User = require('../model/User');
const Product = require('../model/Product');
const Purchase = require('../model/Purchase');
const jwt = require('jsonwebtoken');

const getCurrentUser = async (req , res) => {
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

const getAllPurchase = async (req , res) => {
    const currentUser = await getCurrentUser(req, res);

    try{
        const currentUserDb = await User.findOne({username : currentUser}).exec();

        if(!currentUserDb) return res.sendStatus(500);

        const purchase = await Purchase.find({userId : currentUserDb.id}).exec();

        return res.status(200).json(purchase)
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}


const makePurchases = async (req , res) => {
    const currentUser = await getCurrentUser(req, res);

    const {products , purchasesInfo} = req.body;

    if(!products.length || !purchasesInfo?.name  || !purchasesInfo?.email || !purchasesInfo?.phone || !purchasesInfo?.address || !purchasesInfo?.zipCode || !purchasesInfo?.city || !purchasesInfo?.country || !purchasesInfo?.paymentMethode) return res.sendStatus(400);


    try{
        const currentUserDb = await User.findOne({username : currentUser}).exec() ;

        if(!currentUserDb) return res.sendStatus(500);

        const allProducts = await Product.find().exec();

        if(!allProducts) return res.sendStatus(500);


        const addPriceProduct = products.map(e => {
            
            const filterdProdcuts = allProducts.filter(i => {
                
                return i.id === e.productId
            })
            
            return {
                quantity : e.quantity,
                productId : e.productId,
                price : filterdProdcuts[0].price
            }
        })

        

        const calculateTotal = async () => {
            let totalPrice = 0;
            for(let i = 0 ; i < addPriceProduct.length ; i++){
                let productTotalPrice = addPriceProduct[i].quantity * addPriceProduct[i].price ;
                totalPrice += productTotalPrice ;
            }
            return totalPrice.toFixed(2) ;
        }
        

        const calculateVat = async (vatPercent) => {
            let caculatedVat = 0;
            const total = await calculateTotal() ;
            caculatedVat = +(total/100)*vatPercent
            return caculatedVat.toFixed(2)
        }

        const calculatGrandTotal = async (shippingCost , vatPercent) => {
            let calculatedGrand = 0 ;
            const total = await calculateTotal() ;
            const vat = await calculateVat(vatPercent);
            calculatedGrand = (+shippingCost) + (+vat) + (+total)
            return calculatedGrand.toFixed(2);
        }

        const totalPrice = await calculateTotal();
        const totalVat = await calculateVat(15);
        const grandTotal = await calculatGrandTotal(50 , 15);

        for(let j = 0 ; j < products.length ; j++){
            const product = await Product.findById(products[j].productId)
            if(!product) return res.sendStatus(500);

            if(product.quantity >= products[j].quantity){
                const newQ = product.quantity - products[j].quantity
                product.quantity = newQ;
                product.purchased = product.purchased + products[j].quantity
                product.save();
            }else{
                return res.status(409).json({
                    'message' : `Not Enough Products In Storage Only ${product.quantity} items Left For ${product.productName}` 
                })
            }
        }

        const purchase = await Purchase.create({
            products : products,
            purchasesInfo : purchasesInfo,
            userId : currentUserDb.id,
            total : {
                totalPrice : totalPrice,
                totalVat : totalVat,
                shippingCost : 50 ,
                grandTotal : grandTotal,
            },
            Date : new Date() 
        })

        currentUserDb.cart = [];
        currentUserDb.markModified('cart');
        currentUserDb.save();

        const allProducts2 = await Product.find().exec();
        const result = allProducts2.map(e => {
            return {
                id : e._id,
                productName : e.productName,
                category : e.category,
                price : e.price,
                quantity : e.quantity,
                features : e.features,
                about : e.about,
                purchased : e.purchased,
                dateOfAdded : e.dateOfAdded,
                images : e.imagesDisplay
            }
        })

        return res.status(201).json({
            result
        });
    }catch(err){
        console.log(err)
        return res.sendStatus(500)
    }
}

const getAllPurchaseAndUsers = async (req, res) => {
    try{
        const allUsers = await User.find().exec();
        if(!allUsers) return res.sendStatus(500);

        const users = allUsers.map((e) => {
            if(e.roles?.Admin){
                return {
                    username : e.username,
                    image : e.userImgPath,
                    email : '**********',
                    roles : e.roles,
                    id : e._id
                }
            }
            return {
                username : e.username,
                image : e.userImgPath,
                email : e.email,
                roles : e.roles,
                id : e._id
            }
        })

        const allPurchases = await Purchase.find().exec();

        return res.status(200).json({
            users : users,
            purchases : allPurchases
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

module.exports = {
    getAllPurchase,
    makePurchases,
    getAllPurchaseAndUsers,

    
}