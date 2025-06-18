let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [String]
});

module.exports = mongoose.model('Product', productSchema);