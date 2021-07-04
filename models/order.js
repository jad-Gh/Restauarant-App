const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    status: {
        type:String,
        required:true,
        default: "pending"
    },
    items: [],
    owner: {
        type:String,
        required:true,
    },
    Store:{
        type:String,
        required:true,
        default:" "
    },
    total:{
        type: Number,
        required:true,
        default: 0
    }
});

module.exports = mongoose.model('Order',orderSchema);