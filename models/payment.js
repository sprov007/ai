const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone1: {
    type: String,
    required: true
  },
  amount1: {
    type: Number,
    required: true
  },
  amount2: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  amount3: {
    type: Number,
    required: true
  },
  trxid: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending' // "Pending", "Confirmed", "Expired"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone1: {
    type: String,
    required: true
  },
  amount1: {
    type: Number,
    required: true
  },
  amount2: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  amount3: {
    type: Number,
    required: true
  },
  trxid: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending' // "Pending", "Confirmed", "Expired"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 360 * 360 * 10000) // 1 hour expiry
  }
});

module.exports = mongoose.model('Payment', paymentSchema);

});

module.exports = mongoose.model('Payment', paymentSchema);
