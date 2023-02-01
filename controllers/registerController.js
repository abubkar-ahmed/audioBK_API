const nodemailer = require('nodemailer');
const User = require('../model/User')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const byteSize = require('byte-size');


const handleNewUser = async (req , res) => {
    console.log('function triggred')

    const {user ,email , pwd , rPwd} = req.body ;
    if (!user || !email || !pwd || !rPwd) return res.status(400).json({
        'message' : 'All Fileds Are Required.',
    })

    const regularExpression= /^[a-z0-9_-]{3,12}$/i;
    if(!regularExpression.test(user)) return res.status(409).json({
        'message' : 'Invalied User Name'
    })

    const rgxEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if(!rgxEmail.test(email)) return res.status(409).json({
        'message' : 'Invalied Email'
    })

    const duplicatedUser = await User.findOne({username : user}).exec();
    const duplicatedemail = await User.findOne({email : email}).exec();

    if(duplicatedUser) return res.status(409).json({'message' : 'Username is Already Taken'});
    if(duplicatedemail) return res.status(409).json({'message' : 'Email is Already Registerd'});
    if(pwd !== rPwd) return res.status(409).json({
        'message' : 'Password Must Be same As Repeated Password'
    })

    const verificationCode = uuidv4().split('-')[0];

    console.log('inputs checked')
    try{
        console.log('creating user')
        const newUser = new User({});
        if(req?.files?.img){
            const acceptedType = ['image/png', 'image/jpg', 'image/jpeg' , 'image/webp'] ;
            const img = req.files.img ;
            if(!acceptedType.includes(img?.mimetype)) {
                return res.status(400).json({
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
                saveImage(newUser, img);
            }else {
                return res.status(400).json({
                    'message' : 'Max Size For Image Is 5MB'
                })
            }
        }

        function saveImage(newUser, imgEncoded) {
            const img = imgEncoded;
            newUser.img = new Buffer.from(img.data, "base64");
            newUser.imgType = img.mimetype;

        }

        const hashPassword = await bcrypt.hash(pwd , 10);

        newUser.username = user;
        newUser.email = email ;
        newUser.password = hashPassword;
        newUser.verificationCode = verificationCode;

        
        console.log('setting up email')
        const trasporter = nodemailer.createTransport({
            service:'hotmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD
            }
        })
        console.log(process.env.EMAIL)
        console.log(process.env.EMAIL_PASSWORD)
    
        const mailOptions = {
            from:process.env.EMAIL,
            to:email,
            subject: 'AudiFill',
            html:`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap" rel="stylesheet">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Sono:wght@400;700&display=swap" rel="stylesheet">
                <title>Email Verification</title>
                <style>
                    *{
                        padding: 0;
                        margin: 0;
                        box-sizing: border-box;
                        font-family: 'Manrope', sans-serif;
                    }
                    body{
                        background-color: #f1f1f1;
                        color: black;
                    }
                    header{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 1rem;
                        margin-bottom: 2rem;
                        background-color: black;
                        border-radius: 0.5rem;
                    }
                    h1{
                        font-family: 'Sono', sans-serif;
                        padding: 1rem;
                        color: white;
                        width: fit-content;
                        margin: auto;
                    }
                    main{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                        gap: 1rem;
                        
                    }
                    span{
                        color: #d87d4a;
                        text-transform: none;
                    }
                    h2{
                        letter-spacing: 0.125rem;
                        font-size: 24px;
                        text-transform: uppercase;
                        font-weight: bold;
                        margin: auto;
                    }
                    h3{
                        letter-spacing: 0.125rem;
                        font-size: 18px;
                        text-transform: uppercase;
                        font-weight: bold;
                        margin: auto;
                    }
                    h4{
                        letter-spacing: 0.125rem;
                        font-size: 16px;
                        font-weight: bold;
                        background-color: #80808047;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        color: #d87d4a;
                        width: fit-content;
                        margin: auto;
                    }
                    @media (max-width: 669px) {
                        h2{
                            font-size: 16px;
                            padding: 1rem;
                            margin-top: 1rem;
                        }
                        h3{
                            margin-top: 1rem;
                            font-size: 14px;
                            padding: 0 1rem;
                        }
                        h4{
                            margin-top: 1rem;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>audioBk</h1>
                </header>
                <main>
                    <h2>Welcome ${user} To <span>audioBk</span></h2>
                    <h3>Your Verification Code Is</h3>
                    <h4>${verificationCode}</h4>
                </main>
            </body>
            </html>           
            `
        }
        

        console.log('sending email')
        trasporter.sendMail(mailOptions,async function(error , info){
            if(error){
                console.log('the err')
                console.log(error)
                return res.sendStatus(500);
            }else{
                console.log('saving')
                const result = await newUser.save();
                console.log('save done')
                return res.status(201).json({'success' : `New User ${user} Created`});
            }
        })
        
        
    }catch (err) {
        console.log(err)
        return res.status(500).json({'message' : `${err}`})
    }

}


const handleVerificationStatus = async (req, res) => {
    const {email , pwd , code} = req.body ;
    if (!email || !pwd || !code ) return res.status(400).json({
        'message' : 'All Fileds Are Required.',
    })

    const verUser = await User.findOne({email : email}).exec();

    if(!verUser) return res.status(400).json({
        'message' : 'Bad Credentials'
    })

    const match = await bcrypt.compare(pwd , verUser.password);
    
    if(match){
        if(verUser.verified === true){
            res.status(409).json({
                'message' : 'User Already Verified'
            })
        }else{
            if(verUser.verificationCode === code){
                verUser.verified = true;
                verUser.verificationCode = '';
                const result = await verUser.save();
                res.sendStatus(201);
            }else{
                res.status(401).json({
                    'message' : 'Invalied Code'
                })
            }
        }

    }else{
        return res.status(400).json({
            'message' : 'Bad Credentials'
        })
    }
}




module.exports = {handleNewUser , handleVerificationStatus}