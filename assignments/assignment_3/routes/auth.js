let express = require('express')
let router = express.Router()
let Order = require('../models/order.model');
let Product = require('../models/product.model');
let User = require('../models/User.model')
let admin = require('../models/Admin.user.model')
let Complaint = require('../models/complain.model'); 
let complaintController = require('../controllers/Users/users.complaint.controller') 


router.get('/register', (req, res) => {
    res.render('auth', { formType: 'register' , cssFile: 'auth'});
});

router.get('/login', (req, res) => {
    res.render('auth', { formType: 'login' , cssFile: 'auth'});
});

router.get('/adminLogin', (req,res) =>{
  res.render('auth', {formType: 'admin', cssFile: 'auth'})
})

router.post('/register', async (req, res) =>{
    const {email, password} = req.body;
    try{
        const user = new User({email, password});
        await user.save();
        req.session.user = {_id: user._id, email: user.email};
        res.redirect("/auth/profile")

    }catch(e){
        if(e.code == 11000){
            res.status(400).send("Email Already Exists");
        }
        else res.status(500).send("Registration Not Successfull");
    }
});

router.post('/login', async (req, res) => {
    const {email,password} = req.body;
    try{
        const user = await User.findOne({email})
        if(!user || !(await user.comparePassword(password))){
            res.status(400).send("Invalid Credentials")
        }
        else {
            req.session.user = {_id: user._id, email: user.email};
            console.log(user._id);
            console.log(req.session.user._id);
            console.log(req.session.user.email)
            res.redirect('/auth/profile')
        }
    }catch(e){
        res.status(500).send("Login Failed")
    }
});

router.post('/adminLogin', async (req, res) => {
  const {email,password} = req.body;
  try{
        const adminUser = await admin.findOne({email})
        if(!adminUser || !(await adminUser.comparePassword(password))){
            res.status(400).send("Invalid Credentials")
        }
        else {
            req.session.adminUser = {_id: adminUser._id, email: adminUser.email};
            console.log(adminUser._id);
            console.log(req.session.adminUser._id);
            console.log(req.session.adminUser.email)
            res.redirect('/admin/ListProducts')
        }
    }catch(e){
        res.status(500).send("Admin Login Failed")
    }
});

router.get('/logout', (req, res)=>{
    req.session.destroy(error =>{
        if(error) return res.send("Logout Failed!");
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');

    })
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); 
  } else {
    return res.redirect('/auth/login'); 
  }
}

router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { page: 'profile',user: req.session.user , cssFile: 'profile'});
  console.log(req.session.user.email)
});


router.get('/my-orders', isAuthenticated, async (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.redirect('/auth/login');

  try {
    const orders = await Order.find({ email });

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

    res.render('profile', { page: "orders" ,items: allItems, cssFile: 'profile' });
  } catch (err) {
    console.error("Error fetching orders or products:", err);
    res.status(500).send("Failed to load orders.");
  }
});

  
function isadminAuthenticated(req, res, next) {
  if (req.session.adminUser) {
    return next(); 
  } else {
    return res.redirect('/auth/login'); 
  }
}

router.get('/admin', isadminAuthenticated , (req, res,next) =>{
  res.render('adminportal', {page: 'profile', cssFile: 'profile'});
});

router.get('/contact-us', isAuthenticated, (req, res)=> {
  res.render('profile', {page: 'contact', cssFile: 'profile'});
});



router.post('/submit-complaint', isAuthenticated, async (req, res) => {
  try {
    const { ordernumber, complain } = req.body;  
    const email = req.session.user.email; 

    const orders = await Order.find({});
    const matchingOrder = orders.find(order => 
      order._id && order._id.toString().slice(-9) === ordernumber
    );

    if (!matchingOrder) {
      return res.status(400).send(`<script>alert('Order ID not found!'); window.history.back();</script>`);
    }

    const newComplaint = new Complaint({
      orderId: ordernumber,
      email: email,
      complain: complain
    });

    await newComplaint.save();
    res.redirect('/auth/profile'); 

  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting complaint');
  }
});



router.get('/my-complaints',isAuthenticated ,async (req, res) => {
  try {
    const email = req.session.user.email;
    const complaints = await Complaint.find({ email: email }).sort({ createdAt: -1 });

    res.render('profile', { page: 'My-complaints',complaints ,cssFile: 'profile' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching complaints');
  }
});



router.isAuthenticated = isAuthenticated;
router.isadminAuthenticated = isadminAuthenticated;
module.exports = router;
