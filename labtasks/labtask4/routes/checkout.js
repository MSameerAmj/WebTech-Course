let express = require('express')
let router = express.Router()
let Order = require('../models/order.model');
const authRouter = require('../routes/auth');

const isAuthenticated = authRouter.isAuthenticated;

router.get('/checkout', isAuthenticated ,(req, res) => {
  const cart = req.session.cart || { items: [], cart_total: 0 };
  res.render('checkout', { cart , cssFile: 'checkout'});
});

router.post('/place-order', async (req, res) => {
  const { name, phone, address } = req.body;
  const cart = req.session.cart;
  const email = req.session.user.email;
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.send("Cart is empty.");
  }

  const order = new Order({
    email,
    name,
    phone,
    address,
    items: cart.items,
    totalAmount: cart.cart_total,

  });

  try {
    await order.save();
    req.session.cart = { items: [], cart_total: 0 };
    res.redirect('/')
  } catch (error) {
    console.error("order error:", error);
    res.status(500).send("Internal Server error");
  }
});

module.exports = router;