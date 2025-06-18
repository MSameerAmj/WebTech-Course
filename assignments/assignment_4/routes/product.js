let express = require('express')
let router = express.Router()
const mongoose = require('mongoose');


let Product = require('../models/product.model')

router.get('/:id', async (req , res) => {
    try{
        const productId = req.params.id;

        const product = await Product.findOne({ _id: new mongoose.Types.ObjectId(productId) });
        if(!product){
            return res.status(404).send("Product not found");
        }
        res.render('ProductPage', {product, cssFile: 'ProductPage'});
    }catch(e){
        console.log("error", e);
        res.status(404).send("Internal Server Error!");
    }
});

module.exports = router;


