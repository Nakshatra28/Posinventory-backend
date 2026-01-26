const Account = require('../models/Account');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Purchase = require('../models/purchaseOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const logAction = require('../utils/auditLogger');


exports.getAccountSummary = async (req, res) => {
  try {
    // Total Sales
    const sales = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    // Outstanding Amount
  const outstanding = await Invoice.aggregate([
  { $match: { paymentStatus: { $ne: "paid" } } },
  {
    $project: {
      remaining: { $subtract: ["$grandTotal", "$paidAmount"] }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$remaining" }
    }
  }
]);


const paidAgg = await Payment.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" }
    }
  }
]);

    // Stock Value
    const stock = await Product.aggregate([
      {
        $project: {
          value: { $multiply: ["$stock", "$price"] }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    // Active Customers
    const activeCustomers = await Customer.countDocuments({ status: "active" });

    res.status(200).json({
      totalSales: sales[0]?.total || 0,
      outstandingAmount: outstanding[0]?.total || 0,
      stockValue: stock[0]?.total || 0,
       totalPaid: paidAgg[0]?.total || 0,   
      activeCustomers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAccountsList = async (req, res) => {
  try {
    const accounts = await Account.find({ status: "active" });

    // Calculations
    const sales = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const receivable = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$remainingAmount" } } }
    ]);

    const cash = await Payment.aggregate([
      { $match: { method: "cash" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const bank = await Payment.aggregate([
      { $match: { method: { $ne: "cash" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const purchase = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const inventory = await Product.aggregate([
      {
        $project: {
          value: { $multiply: ["$stock", "$price"] }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const result = accounts.map(acc => {
      let balance = 0;

      if (acc.name === "Sales") balance = sales[0]?.total || 0;
      if (acc.name === "Accounts Receivable") balance = receivable[0]?.total || 0;
      if (acc.name === "Cash") balance = cash[0]?.total || 0;
      if (acc.name === "Bank") balance = bank[0]?.total || 0;
      if (acc.name === "Purchase") balance = purchase[0]?.total || 0;
      if (acc.name === "Inventory") balance = inventory[0]?.total || 0;

      return {
        code: acc.code,
        name: acc.name,
        category: acc.category,
        type: acc.type,
        balance
      };
    });

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getAccountLedger = async (req, res) => {
  try {
    const { code } = req.params;
    let ledger = [];

    // 🔹 CASH ACCOUNT (1001)
    if (code === '1001') {
      // Debit → payments received
      const payments = await Payment.find();

      ledger = payments.map(p => ({
        date: p.createdAt,
        description: `Payment received`,
        debit: p.amount,
        credit: 0
      }));
    }

    // 🔹 SALES ACCOUNT (4001)
    if (code === '4001') {
      const invoices = await Invoice.find();

      ledger = invoices.map(inv => ({
        date: inv.invoiceDate || inv.createdAt,
        description: `Invoice ${inv.invoiceNo || ''}`,
        debit: 0,
        credit: inv.grandTotal
      }));
    }

    // 🔹 PURCHASE ACCOUNT (5001)
    if (code === '5001') {
      const purchases = await Purchase.find();

      ledger = purchases.map(p => ({
        date: p.createdAt,
        description: `Purchase`,
        debit: p.totalAmount,
        credit: 0
      }));
    }

    // 🔹 SORT BY DATE
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 🔹 CALCULATE RUNNING BALANCE
    let balance = 0;
    const finalLedger = ledger.map(row => {
      balance += row.debit - row.credit;
      return {
        ...row,
        balance
      };
    });

    res.status(200).json(finalLedger);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
