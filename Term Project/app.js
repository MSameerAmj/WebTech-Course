let express = require("express")
let server = express()
let expressLayouts = require('express-ejs-layouts');
let productList = require('./data/products');
let mongoose = require('mongoose');
let Product = require('./models/product.model');
let session = require('express-session');
let authRouter = require('./routes/auth');
let productRouter = require('./routes/product')
let checkoutRouter = require('./routes/checkout')
let adminRouter = require('./routes/admin');
const fileUpload = require('express-fileupload');

server.use(fileUpload({
  useTempFiles: true,         // Needed for larger files
  tempFileDir: '/tmp/'        // Required when using temp files
}));
server.set("view engine", "ejs");
server.use(express.static("public"));
server.use(expressLayouts);
server.set('layout', 'layout');
server.use(express.urlencoded({extended: true}))

mongoose.connect('mongodb://127.0.0.1:27017/Makintosh')
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));




server.use(session({
  secret: 'My_Term_Project_Makintosh',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 900000}
}));

server.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

server.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

server.use((req, res, next) => {
  res.locals.cart = req.session.cart || [];
  next();
});

server.post('/add-to-cart', async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).send("Product not found");

  // Initialize session cart as an object
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      cart_total: 0
    };
  }

  const cart = req.session.cart;
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    cart.cart_total += existingItem.price;
  } else {
    const newItem = {
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    };
    cart.items.push(newItem);
    cart.cart_total += newItem.price;
  }
  console.log(cart);
  console.log("Cart total:", cart.cart_total);
  res.redirect('back');
});

server.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('index', { products });
  } catch (err) {
    res.status(500).send("Database error");
  }
});


server.use('/auth', authRouter);

server.use('/product', productRouter);

server.use('/cart', checkoutRouter);

server.use('/admin', adminRouter);

server.use(express.json());

server.listen(3000)
