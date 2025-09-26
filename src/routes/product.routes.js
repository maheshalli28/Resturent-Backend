const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { configureCloudinary } = require('../utils/cloudinary');

const cloudinary = configureCloudinary();
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

// Fallback local storage if Cloudinary is not configured
const uploadsDir = path.join(process.cwd(), 'resturent_backend', 'microservers', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const memoryUpload = multer({ storage: multer.memoryStorage() });
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  })
});

const upload = hasCloudinary ? memoryUpload : diskUpload;

// GET all products
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// CREATE product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, category, price, status } = req.body;
    let imagePath;
    if (req.file) {
      if (hasCloudinary) {
        async function uploadToCloudinary(buffer) {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'resturent/products' }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            stream.end(buffer);
          });
        }
        const result = await uploadToCloudinary(req.file.buffer);
        imagePath = result.secure_url;
      } else {
        imagePath = '/uploads/' + req.file.filename;
      }
    }
    const product = await Product.create({
      title,
      category,
      price,
      status: status === 'true' || status === true,
      image: imagePath,
    });
    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to create product' });
  }
});

// UPDATE product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price, status } = req.body;
    const update = { title, category, price, status: status === 'true' || status === true };
    if (req.file) {
      if (hasCloudinary) {
        async function uploadToCloudinary(buffer) {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'resturent/products' }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            stream.end(buffer);
          });
        }
        const result = await uploadToCloudinary(req.file.buffer);
        update.image = result.secure_url;
      } else {
        update.image = '/uploads/' + req.file.filename;
      }
    }
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    res.json(product);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;


