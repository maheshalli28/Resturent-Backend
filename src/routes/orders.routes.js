const router = require('express').Router();
const Order = require('../models/Order');

// Get all orders
router.get('/', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Seed route removed for production use

// Create order
router.post('/', async (req, res) => {
  try {
    const { items, customerName, customerEmail, customerPhone, address, pincode, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    console.log('Incoming order:', {
      itemsCount: Array.isArray(items) ? items.length : 0,
      customerName,
      customerEmail,
    });
    const subtotal = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity || 1), 0);
    const tax = req.body.tax != null ? Number(req.body.tax) : +(subtotal * 0.08).toFixed(2);
    const deliveryFee = req.body.deliveryFee != null ? Number(req.body.deliveryFee) : (items.length > 0 ? 2.99 : 0);
    const totalAmount = +(subtotal + tax + deliveryFee).toFixed(2);
    const order = await Order.create({
      items,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      address,
      pincode,
      paymentMethod
    });
    console.log('Order created:', order._id);
    res.status(201).json(order);
  } catch (e) {
    console.error('Create order failed:', e);
    res.status(400).json({ message: 'Failed to create order', error: e?.message || 'unknown' });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json(order);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to update order' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to delete order' });
  }
});

module.exports = router;


