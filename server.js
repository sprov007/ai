const Payment = require('./models/Payment');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: ['https://sprov007.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ message: `Welcome ${user.username}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment Routes
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

    // Validation
    if (!company || !phone || !password || !serviceType || !name || 
        !phone1 || !amount1 || !amount2 || !method || !amount3 || !trxid) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (amount1 < 100 || amount2 < 100 || amount3 < 100) {
      return res.status(400).json({ message: 'Minimum amount is 100 BDT' });
    }

    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

   const expectedAmount = (parseFloat(amount1) - parseFloat(amount2)) / 2;
const tolerance = 0.01;
if (Math.abs(parseFloat(amount3) - expectedAmount) > tolerance) {
  return res.status(400).json({ message: 'Amount calculation mismatch' });
}
    // Create payment
    const payment = new Payment({
      user: req.user.id,
      company,
      phone,
      password: await bcrypt.hash(password, 10),
      serviceType,
      name,
      phone1,
      amount1,
      amount2,
      method,
      amount3,
      trxid,
      status: 'Pending'
    });

    await payment.save();
    res.status(201).json({ message: 'Payment submitted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

app.get('/last-payment', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!payment) return res.status(404).json({ message: 'No payments found' });

    delete payment.password;
    delete payment.__v;
    
    res.json(payment);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
