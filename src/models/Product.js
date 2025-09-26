const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: Boolean, default: true },
    image: { type: String }, // stored as /uploads/filename.ext
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);


