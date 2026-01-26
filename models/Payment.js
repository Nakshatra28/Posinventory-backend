const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      
        default: null  
    },

    customerName: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank'],
      required: true
    },

    status: {
      type: String,
      enum: ['paid', 'partial'],
      default: 'paid'
    },

    note: {
      type: String,
      trim: true
    },

    referenceNo: {
  type: String,
  trim: true
},
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Payment', paymentSchema);
