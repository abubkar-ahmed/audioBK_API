const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const productSchema = new Schema({
    productName : {
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    dateOfAdded : {
        type : String,
        default : new Date().toLocaleDateString('en-us', { 
            year:"numeric",
            month:"numeric",
            day:"numeric"
        })
    },
    price : {
        type : Number,
        required : true
    },
    quantity : {
        type : Number,
        required: true
    },
    purchased : {
        type : Number,
        default : 0
    },
    features : {
        type : Array,
        required : true
    },
    about : {
        type : String,
        required : true
    },
    images : [{
        data:{
            type : Buffer
        },
        imgType : {
            type: String,
        }
    }],
    comments : [{
        comment : {
            type:String,
            required : true,
        },
        date : {
            type: Date,
        },
        likes : {
            type : Array
        },
        createdBy : {
            type : String
        }
    }]

});


productSchema.virtual('imagesDisplay').get(function (){
    const displayImegs = this.images.map(e => {
        return `data:${e.imgType};charset=utf-8;base64,${e.data.toString('base64')}`
    })
    return displayImegs ;
})




module.exports = mongoose.model('Product' , productSchema);