const mongoose = require('mongoose');

// In models/Payment.js
const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: String,
  phone: String,
  password: String,
  serviceType: String,
  name: String,
  phone1: String,
  amount1: Number,
  amount2: Number,
  method: String,
  amount3: Number,
  trxid: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
