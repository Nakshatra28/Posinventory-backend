const express = require('express');
const router = express.Router();

const {
  createPayment,
  getAllPayments,
  getPaymentsByInvoice
} = require('../controllers/paymentController');

router.post('/', createPayment);               // add payment
router.get('/', getAllPayments);                // list payments
router.get('/:invoiceId', getPaymentsByInvoice); // invoice payments

module.exports = router;
