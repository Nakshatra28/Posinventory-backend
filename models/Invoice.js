const mongoose = require("mongoose");

/* 🔹 Invoice Item Schema */
const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

/* 🔹 Invoice Schema */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String
    },

    items: [invoiceItemSchema],

    subTotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    paidAmount: {
  type: Number,
  default: 0
},

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
      required: true
    },
   paymentStatus: {
  type: String,
  enum: ["unpaid", "partial", "paid"],
  default: "unpaid"
},

    invoiceDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date
    },

    createdBy: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
