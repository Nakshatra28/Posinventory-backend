const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUST"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    referenceType: {
      type: String,
      enum: ["invoice", "purchase", "manual"],
      required: true
    },

    referenceId: {
      type: String,
      required: true
    },

    user: {
      type: String,
      default: "Admin"
    },

    remarks: {
      type: String,
      default: ""
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", stockMovementSchema);
