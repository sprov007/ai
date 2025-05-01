require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Payment = require('./models/Payment');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Security Middlewares
// ======================
app.use(helmet());
app.use(cors({
  origin: [
  'https://sprov007.github.io',
  'http://localhost:5500', // Common Live Server port
  'http://127.0.0.1:5500'
],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// ======================
// Database Connection
// ======================
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======================
// Authentication Middleware
// ======================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({
      success: false,
      message: error.expiredAt ? 'Session expired' : 'Invalid token'
    });
  }
};

// ======================
// Routes
// ======================

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 12)
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Bulk Payment Route
app.post('/payment', authMiddleware, async (req, res) => {
  try {
    const { 
      company,
      phone,
      password,
      method,
      trxid,
      amount3,
      consignments
    } = req.body;

    // Validate required fields
    const requiredFields = ['company', 'phone', 'password', 'method', 'trxid', 'amount3', 'consignments'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate consignments
    if (!Array.isArray(consignments) || consignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one consignment required'
      });
    }

    // Validate amounts
    const totalCharge = consignments.reduce((total, consignment) => {
      const amount1 = parseFloat(consignment.amount1) || 0;
      const amount2 = parseFloat(consignment.amount2) || 0;
      return total + ((amount1 - amount2) / 2);
    }, 0);

    if (Math.abs(totalCharge - parseFloat(amount3)) > 0.5) {
      return res.status(400).json({
        success: false,
        message: `Server charge mismatch. Calculated: ৳${totalCharge.toFixed(2)}`
      });
    }

    // Check for existing transaction
    const existingPayment = await Payment.findOne({ trxid });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Transaction ID already used'
      });
    }

    // Create payment with consignments
    const payment = new Payment({
      user: req.user._id,
      company,
      phone: phone.replace(/\D/g, ''),
      password: await bcrypt.hash(password, 12),
      method,
      trxid,
      amount3: parseFloat(amount3),
      consignments: consignments.map(c => ({
        name: c.name,
        phone: c.phone.replace(/\D/g, ''),
        amount1: parseFloat(c.amount1),
        amount2: parseFloat(c.amount2)
      })),
      status: 'Pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: `${consignments.length} consignments submitted successfully`,
      paymentId: payment._id,
      totalCharge: amount3
    });

  } catch (error) {
    console.error('Payment Error:', error);
    const message = error.message.startsWith('Server charge mismatch') 
      ? error.message
      : 'Server error during payment processing';
    res.status(500).json({ success: false, message });
  }
});

// ======================
// Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });
});
