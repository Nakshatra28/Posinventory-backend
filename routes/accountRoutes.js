const express = require("express");
const router = express.Router();

const {
  getAccountSummary,
  getAccountsList,
  getAccountLedger
} = require("../controllers/accountController");

router.get("/summary", getAccountSummary);
router.get("/list", getAccountsList);
router.get('/ledger/:code', getAccountLedger); // ✅ NEW

module.exports = router;
