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

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Security Middlewares
// ======================
app.use(helmet());
app.use(cors({
  origin: [
    'https://sprov007.github.io',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header missing'
      });
    }

    // Handle both "Bearer token" and direct token cases
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
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

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// User Registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check existing user
    if (await User.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 12)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Payment Processing
app.post('/payment', authMiddleware, async (req, res) => {
  try {
    const { 
      company,
      phone,
      password,
      serviceType,
      name,
      phone1,
      amount1,
      amount2,
      method,
      amount3,
      trxid
    } = req.body;

    // Validate required fields
    if (!company || !phone || !password || !serviceType || !name || 
        !phone1 || !amount1 || !amount2 || !method || !amount3 || !trxid) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Numeric validation
    const amounts = {
      amount1: parseFloat(amount1),
      amount2: parseFloat(amount2),
      amount3: parseFloat(amount3)
    };

    if (isNaN(amounts.amount1) || isNaN(amounts.amount2) || isNaN(amounts.amount3)) {
      return res.status(400).json({
        success: false,
        message: 'Amounts must be valid numbers'
      });
    }

    if (amounts.amount1 < 100 || amounts.amount2 < 100 || amounts.amount3 < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is 100 BDT'
      });
    }

    // Payment calculation validation
    const expectedAmount = (amounts.amount1 - amounts.amount2) / 2;
    if (Math.abs(amounts.amount3 - expectedAmount) > 0.5) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Expected: ৳${expectedAmount.toFixed(2)}`
      });
    }

    // Check duplicate transaction
    const existingPayment = await Payment.findOne({ trxid });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Transaction ID already used'
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      company,
      phone: cleanPhone,
      password: await bcrypt.hash(password, 12),
      serviceType,
      name,
      phone1,
      amount1: amounts.amount1,
      amount2: amounts.amount2,
      method,
      amount3: amounts.amount3,
      trxid,
      status: 'Pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully',
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Payment Error:', error);
    const message = error.code === 11000 
      ? 'Duplicate transaction detected' 
      : 'Payment processing failed';
    
    res.status(500).json({
      success: false,
      message
    });
  }
});

// ======================
// Error Handling Middleware
// ======================
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ======================
// Server Setup
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });
});
