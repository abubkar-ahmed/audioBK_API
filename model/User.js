const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const userSchema = new Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        MainAdmin: Number,
        Admin: Number,
    },
    verified : {
        type : Boolean,
        default : false,
    },
    verificationCode:{
        type : String
    },
    img: {
        type: Buffer,
    },
    imgType: {
        type: String,
    },
    resetPwd : {
        type : String
    },
    refreshToken : String,
    cart : {
        type : Array
    }
});

userSchema.virtual('userImgPath').get(function (){
    if(this.img != null && this.imgType != null){
        return `data:${this.imgType};charset=utf-8;base64,${this.img.toString('base64')}`;
    }
})

module.exports = mongoose.model('User' , userSchema);