const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const logAction = require('../utils/auditLogger');

// CREATE PAYMENT
exports.createPayment = async (req, res) => {
  console.log("REQ BODY:", req.body);

  try {
    const { invoiceId, customerName, amount, method, note, referenceNo } = req.body;

    if (!invoiceId || !customerName || !amount || !method) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const remaining = invoice.grandTotal - (invoice.paidAmount || 0);
    if (amount > remaining) {
      return res.status(400).json({
        message: 'Payment amount exceeds remaining balance'
      });
    }

    // 1️⃣ Create payment
    const payment = new Payment({
      invoiceId,
      customerName,
      amount,
      method,
      referenceNo,
      note,
      status: amount < remaining ? 'partial' : 'paid'
    });

    await payment.save();

    // 2️⃣ Update invoice
    invoice.paidAmount = Number(invoice.paidAmount || 0) + Number(amount);
    invoice.paymentStatus =
      invoice.paidAmount >= invoice.grandTotal ? 'paid' : 'partial';

    await invoice.save();

    // ✅ AUDIT LOG (CORRECT PLACE)
    await logAction({
      module: 'Payment',
      action: 'CREATE',
      details: `Payment ₹${amount} received from ${customerName}`,
      ipAddress: req.ip
    });

    // 3️⃣ Response
    res.status(201).json({
      success: true,
      payment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PAYMENTS BY INVOICE ID
exports.getPaymentsByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payments = await Payment.find({ invoiceId })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

