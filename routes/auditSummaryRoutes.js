const express = require('express');
const router = express.Router();

const {
  getAuditSummaryCards
} = require('../controllers/auditSummaryController');

// TOP CARDS SUMMARY
router.get('/summary-cards', getAuditSummaryCards);

module.exports = router;
