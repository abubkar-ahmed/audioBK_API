const Product = require('../model/Product');
const byteSize = require('byte-size');

const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find().exec();
        const result = products.map(e => {
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
        return res.status(200).json({products : result});
    }catch (err){
       if(err) return res.sendStatus(500);
    }
}


const addNewProducts = async (req, res) => {
    const {
        productName,
        category,
        price,
        quantity,
        about 
    } = req.body;

    const features = JSON.parse(req.body.features) ;
    const allowedCategorys = ['headphones' , 'speakers' , 'earphones']

    if(!productName || !category || !price || !quantity || !features.length === 0 || !about) return res.status(400).json({
        'message' : 'All Fields Are Required'
    })

    if(!allowedCategorys.includes(category)) return res.status(400).json({
        'message' : 'Unkown Category'
    })

    if(isNaN(price)) return res.status(400).json({
        'message' : 'Plese Enter Valied Price'
    });

    if(isNaN(quantity)) return res.status(400).json({
        'message' : 'Plese Enter Valied Quantity'
    });

    try{
        const newProduct = new Product({});

        if(req?.files){
            const acceptedType = ['image/png', 'image/jpg', 'image/jpeg' , 'image/webp'] ;
            if(req?.files?.img1){
                const img = req?.files?.img1 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(newProduct, img);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                
            }
            if(req?.files?.img2){
                const img = req?.files?.img2 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(newProduct, img);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
            }
            if(req?.files?.img3){
                const img = req?.files?.img3 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(newProduct, img);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
            }
            function saveImage(newProduct, imgEncoded) {
                const img = imgEncoded;
                newProduct.images.push({data : new Buffer.from(img.data, "base64")  , imgType : img.mimetype});

            }
        }else{
            return res.status(400).json({
                'message' : 'Please Add Some Images'
            })
        }
        
        
        newProduct.productName = productName ;
        newProduct.category = category ;
        newProduct.price = price ;
        newProduct.quantity = quantity ;
        newProduct.features = features ;
        newProduct.about = about ;


        await newProduct.save();

        const products = await Product.find().exec();
        const result = products.map(e => {
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


const updateProduct = async (req , res) => {
    const {productId} = req.body ;
    if(!productId) return res.status(400).json({
        'message' : 'Please Add Product Id'
    })

    const {productName , category , price , quantity , about} = req.body ;
    const features = JSON.parse(req.body.features) ;

    if(!productName || !category || !price || !quantity || !features.length === 0 || !about) return res.status(400).json({
        'message' : 'All Fields Are Required'
    })

    if(isNaN(price)) return res.status(400).json({
        'message' : 'Plese Enter Valied Price'
    });

    const allowedCategorys = ['headphones' , 'speakers' , 'earphones']

    if(!allowedCategorys.includes(category)) return res.status(400).json({
        'message' : 'Unkown Category'
    })

    try{
        const product = await Product.findById(productId).exec();
        if(!product) return res.status(400).json({
            'message' : 'Please Enter Correct Id'
        });

        product.productName = productName;
        product.category = category ;
        product.price = price ;
        product.quantity = quantity;
        product.features = features;
        product.about = about ;
        if(req?.files){
            const acceptedType = ['image/png', 'image/jpg', 'image/jpeg' , 'image/webp'] ;
            if(req?.files?.img1){
                const img = req?.files?.img1 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(product, img , 0);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                
            }
            if(req?.files?.img2){
                const img = req?.files?.img2 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(product, img , 1);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
            }
            if(req?.files?.img3){
                const img = req?.files?.img3 ;
                if(!acceptedType.includes(img?.mimetype)) {
                    return res.status(409).json({
                        'message' : 'invalied Image Type'
                    })
                }
                const size = byteSize(img.size);

                if(size.unit === 'MB' && size.value > 5){
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
                if(size.unit === 'kB' || size.unit === 'MB'){
                    saveImage(product, img , 2);
                }else {
                    return res.status(400).json({
                        'message' : 'Max Size For Image Is 5MB'
                    })
                }
            }
            function saveImage(product, imgEncoded, id) {
                const img = imgEncoded;
                product.images[id] = {
                    data : new Buffer.from(img.data, "base64")  , imgType : img.mimetype
                }

            }
        }

        await product.save();

        const products = await Product.find().exec();
        const result = products.map(e => {
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

    }catch(err) {
        if(err) return res.sendStatus(500);
    }

}


const deleteProduct = async (req,res) => {
    if(!req?.params?.id) return res.sendStatus(400);
    const id = req?.params?.id ;
    console.log(id)
    try{
        const product = await Product.findByIdAndDelete(id).exec();
        
        const products = await Product.find().exec();
        const result = products.map(e => {
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
        if(err) return res.sendStatus(500);
    }
}

module.exports = {getAllProducts , addNewProducts , updateProduct , deleteProduct} 