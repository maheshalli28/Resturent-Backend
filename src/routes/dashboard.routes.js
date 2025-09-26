const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, requireAdmin } = require('../utils/middleware');

router.get('/stats', async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const inStock = products.filter(p => p.status).length;
    const inStockPercentage = totalProducts ? Math.round((inStock / totalProducts) * 100) : 0;
    const orders = await Order.find();
    const totalOrders = orders.length;
    const today = new Date();
    const todayString = today.toLocaleDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === todayString).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    res.json({ totalProducts, inStock, inStockPercentage, totalOrders, todayOrders, totalRevenue });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to compute stats' });
  }
});

module.exports = router;

// Admin: list users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('name email role createdAt');
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


