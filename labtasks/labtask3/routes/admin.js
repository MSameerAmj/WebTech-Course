let express = require('express')
let router = express.Router()
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
let Product = require('../models/product.model')
let Order = require('../models/order.model')
let Complaint = require('../models/complain.model')

const authRouter = require('../routes/auth');
const isAdmin = authRouter.isadminAuthenticated;

// router.use(fileUpload());


router.get('/ListProducts',isAdmin ,async (req, res)=>{
    const products = await Product.find();
    res.render('adminportal', {page: 'ListProducts', products, cssFile: 'adminPortal'})
});


router.get('/add-product', isAdmin, (req, res)=>{
    res.render('adminportal', {page: 'add-product', cssFile:'adminPortal'})
});


router.post('/add-product', async (req, res) => {
  try {
    
    const { name, price } = req.body;
    const timestamp = Date.now();
    const imageNames = [];
    const uploadDir = 'D:/5th semester/WebTech-Course/Term Project/public/uploads';
    
    
    // Ensure public/uploads directory exists
       
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (!req.files || !req.files.images) {
        return res.status(400).send("No images uploaded.");
        }
        const images = req.files.images;

        // console.log(req.files);
       
      if (!images) {
      return res.status(400).send('No images uploaded.');
      }

    
      if (Array.isArray(images)) {
      // Multiple images
      images.forEach((file, index) => {
        const extension = path.extname(file.name);
        const filename = `${name}${timestamp}${index + 1}${extension}`;
        const savePath = path.join(uploadDir, filename);
        console.log(savePath);
        file.mv(savePath);
        imageNames.push(filename);
      });
    } else {
      // Single image
      const extension = path.extname(images.name);
      const filename = `${name}${timestamp}1${extension}`;
      const savePath = path.join(uploadDir, filename);
      console.log(savePath);
      images.mv(savePath);
      imageNames.push(filename);
    }
    

    const newProduct = new Product({
      name,
      price,
      images: imageNames
    });

    await newProduct.save();
    res.redirect('/');

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/edit-product/:id',isAdmin ,async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    
    res.render('adminportal', {page:'edit-product' ,product, cssFile:'adminPortal' });
  } catch (err) {
    console.error(err);
  }
});

router.post('/edit-product/:id', async (req, res) => {
  try {
    const { name, price } = req.body;

    await Product.findByIdAndUpdate(req.params.id, { name, price });

    res.redirect('/admin/ListProducts'); 
  } catch (err) {
    console.error(err);
    
  }
});

router.post('/delete-product/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/ListProducts'); 
  } catch (err) {
    console.error(err);
  }
});

router.get('/all-orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ });

    const allItems = [];

    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (product) {
          allItems.push({
            name: product.name,
            image: product.images?.[0] || '/placeholder.jpg',
            price: product.price,
            quantity: item.quantity,
            orderId: order._id,
            orderDate: order.createdAt
          });
        }
      }
    }

    res.render('adminportal', { page: "all-orders" ,items: allItems, cssFile: 'adminPortal' });
  } catch (err) {
    console.error("Error fetching orders or products:", err);
    res.status(500).send("Failed to load orders.");
  }
});


router.get('/all-complaints',isAdmin ,async (req, res) => {
  try {
    const complaints = await Complaint.find();

    res.render('adminportal', { page: 'all-complaints',complaints ,cssFile: 'adminPortal' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching complaints');
  }
});

module.exports = router;


