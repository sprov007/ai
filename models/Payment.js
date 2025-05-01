const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /\d{11}/.test(v),
      message: props => `Invalid phone: ${props.value}`
    }
  },
  amount1: { 
    type: Number, 
    required: true,
    min: [100, 'Minimum 100 BDT'],
    max: [100000, 'Maximum 100,000 BDT']
  },
  amount2: { 
    type: Number, 
    required: true,
    min: [100, 'Minimum 100 BDT'],
    max: [100000, 'Maximum 100,000 BDT']
  }
});

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company: { 
    type: String, 
    required: true,
    enum: ['govt_nid', 'redx', 'pathao', 'steadfast']
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: v => /\d{11}/.test(v),
      message: props => `Invalid phone: ${props.value}`
    }
  },
  password: { type: String, required: true },
  consignments: [consignmentSchema],
  method: { 
    type: String, 
    required: true,
    enum: ['Bkash', 'Nagad']
  },
  amount3: { 
    type: Number, 
    required: true,
    min: [100, 'Minimum 100 BDT']
  },
  trxid: { 
    type: String, 
    required: true,
    unique: true,
    minlength: 8
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
