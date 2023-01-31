const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const handleLogin = async (req , res) => {
    const {email , pwd} = req.body ;
    
    if(!email || !pwd ) return res.status(400).json({"message" : 'Email And Password Are Required'});

    const foundUser = await User.findOne({ email : email}).exec();

    if(!foundUser) return res.status(401).json({"message" : 'Bad Caredials'});

    const match = await bcrypt.compare(pwd , foundUser.password);

    try{
        if(match) {
            if(!foundUser.verified) return res.status(401).json({
                'message' : 'Please Verifiy Your Account Before Login.'
            })
            const accessToken = jwt.sign(
                {"username" : foundUser.username},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '50min'}
            )
            const refreshToken = jwt.sign(
                {"username" : foundUser.username},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn : '1d'}
            )
    
            foundUser.refreshToken = refreshToken;
            const result = await foundUser.save();
    
           res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            
            return res.json({ 
                id : result._id,
                username : result.username,
                email : result.email,
                image : result.userImgPath,
                roles : result.roles,
                accessToken : accessToken
             });
        } else {
            return res.status(401).json({"message" : 'Bad Caredials'})
        }
    }
    catch (err){
        return res.sendStatus(500);
    }
}

const handleResetPwd = async (req, res) => {
    const {step} = req.body;
    if(!step) return res.sendStatus(400);

    if(step === 1){
        const {email} = req.body;
        if(!email) return res.status(400);
        const resetPwdUser = await User.findOne({email : email}).exec();
        if(!resetPwdUser) return res.status(400).json({
            'message' : 'User Not Found'
        })

        const verificationCode = uuidv4().split('-')[0]
        const hashCode = await bcrypt.hash(verificationCode , 10);
        try {
            resetPwdUser.resetPwd = hashCode ;
            const result = await resetPwdUser.save();

            const trasporter = nodemailer.createTransport({
                service:'hotmail',
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.EMAIL_PASSWORD
                }
            })
        
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
                        <h2>Reset Password</h2>
                        <h3>Your Verification Code Is</h3>
                        <h4>${verificationCode}</h4>
                    </main>
                </body>
                </html>           
                `
            }
        
            trasporter.sendMail(mailOptions, function(error , info){
                if(error){
                    return res.sendStatus(500)
                }else{
                    return res.status(201).json({'success' : `An Email Was Sent To ${email}`});
                }
            })
        }catch (err){
            return res.sendStatus(500)
        }
    }else if(step === 2){
        const {email , code} = req.body;
        if(!email || !code) return res.sendStatus(400);

        const resetPwdUser = await User.findOne({email : email}).exec();
        if(!resetPwdUser) return res.status(400).json({
            'message' : 'User Not Found'
        })
        const match = await bcrypt.compare(code ,resetPwdUser.resetPwd);
        if(match){
            return res.sendStatus(200);
        }else{
            return res.status(401).json({
                'message' : 'Invailed Code'
            })
        }

    }else if (step === 3){
        const {email , code , pwd , rPwd} = req.body;
        if(!email || !code) return res.sendStatus(400);

        const resetPwdUser = await User.findOne({email : email}).exec();
        if(!resetPwdUser) return res.status(400).json({
            'message' : 'User Not Found'
        })

        if(pwd !== rPwd) return res.status(409).json({
            'message' : 'Password Must Be same As Repeated Password'
        })

        try {
            const match = await bcrypt.compare(code ,resetPwdUser.resetPwd);
            if(match){
                const hashPassword = await bcrypt.hash(pwd , 10);
                resetPwdUser.password = hashPassword;
                const result = await resetPwdUser.save();
                return res.sendStatus(201)
            }else{
                return res.status(401).json({
                    'message' : 'Invailed Code'
                })
            }
        }catch(err) {
            return res.sendStatus(500);
        }
    }else{
        return res.sendStatus(400);
    }
}

module.exports = { handleLogin , handleResetPwd}