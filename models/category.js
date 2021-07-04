const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: String,
    image: String,
    items: []
});

module.exports = mongoose.model('Category',categorySchema);