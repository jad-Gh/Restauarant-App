const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    longitude:Number,
    latitude: Number
});

module.exports = mongoose.model('Branch',branchSchema);

