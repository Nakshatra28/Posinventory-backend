// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
}, { versionKey: false });


module.exports = mongoose.model('Customer', customerSchema);
