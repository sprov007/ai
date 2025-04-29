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

// 1. Middlewares must come first
app.use(cors({
  origin: ['https://sprov007.github.io'] // ✅ Correct GitHub Pages domain
  methods: ['GET', 'POST']
  credentials: true
}));
app.use(express.json()); // ✅ Must parse JSON body!

// 2. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// 3. Routes
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error!' });
  }
});

// Add user reference to payment schema
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ... rest of your existing fields
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials!' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error!' });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, access denied.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ message: `Welcome ${user.username}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error!' });
  }
});

// 4. Start server AFTER middlewares
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Payment route
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

    if (!company || !phone || !password || !serviceType || !name || !phone1 || !amount1 || !amount2 || !method || !amount3 || !trxid) {
      return res.status(400).json({ message: 'Please fill all payment fields!' });
    }
     // Validate amounts
    if (amount1 < 100 || amount2 < 100 || amount3 < 100) {
      return res.status(400).json({ message: 'অগ্রহণযোগ্য পরিমাণ' });
    }

    // Validate phone number format
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'অবৈধ মোবাইল নম্বর' });
    }
    });
  // Server-side validation
   // server.js - Payment route
const expectedAmount = (amount1 - amount2) / 2;
if (Math.abs(amount3 - expectedAmount) > 0.01) {
  return res.status(400).json({ message: 'Amount calculation mismatch' });
}
    // Create new Payment and save
    const payment = new Payment({
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
    });

    await payment.save();

    res.status(201).json({ message: '✅ Payment submitted and saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during payment submission!' });
  }
});
// Get last payment
app.get('/last-payment', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-password -__v');

    if (!payment) return res.status(404).json({ message: 'No payments found' });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

