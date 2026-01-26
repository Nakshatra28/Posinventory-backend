const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  cost: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  stock: {
    type: Number,
    default: 0
  },

  minStock: {
    type: Number,
    default: 0
  },

  maxStock: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "In Stock"  // will auto-change based on stock
  },

  gstRate: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
