const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    code: {
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
      enum: ["Asset", "Liability", "Income", "Expense"],
      required: true
    },

    type: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true
    },

    isSystem: {
      type: Boolean,
      default: false   // true for Cash, Sales, Inventory
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
