const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoice,
  deleteInvoice,
  updateInvoice
} = require("../controllers/invoiceController");


// Create invoice
router.post("/", createInvoice);
router.get("/", getInvoice);
//delete product
router.delete("/",deleteInvoice)

// (next we’ll add list / get by id)

// 🔥 UPDATE invoice route
router.put('/:id', updateInvoice);

module.exports = router;
