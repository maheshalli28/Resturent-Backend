require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./utils/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const ordersRoutes = require('./routes/orders.routes');
const path = require('path');

const app = express();

// Parse allowed origins from .env, remove whitespace
const allowedOrigins = (process.env.CLIENT_URL || '*').split(',').map(origin => origin.trim());

// Log origins for debugging
app.use((req, res, next) => {
  console.log('Request origin:', req.headers.origin);
  console.log('Allowed origins:', allowedOrigins);
  next();
});

// CORS middleware BEFORE any routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl), or if origin is in allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Disable caching for API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/products')) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use('/uploads', express.static(path.join(process.cwd(), 'resturent_backend', 'microservers', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/products', productRoutes);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(port, () => console.log('Server running on port ' + port));
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });