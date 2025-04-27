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
  origin: ['https://sprov007.github.io'], // ✅ Correct GitHub Pages domain
  methods: ['GET', 'POST'],
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
