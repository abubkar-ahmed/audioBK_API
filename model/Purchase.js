const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const PurchaseSchema = new Schema({
    products : {
        type : Array,
        required : true
    },
    purchasesInfo : {
        type : Object ,
        required : true
    },
    userId : {
        type : String,
        required : true,
    },
    total : {
        totalPrice : {
            type : Number,
            require : true
        },
        totalVat : {
            type : Number,
            require : true
        },
        shippingCost : {
            type : Number,
            default : 50,
        },
        grandTotal : {
            type : Number,
            require : true
        }

    },
    Date: {
        type : Date,
    }
});


module.exports = mongoose.model('Purchase' , PurchaseSchema);