const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoice,
  deleteInvoice,
  updateInvoice
} = require("../controllers/invoiceController");


router.post("/", createInvoice);
router.get("/", getInvoice);

router.delete("/",deleteInvoice)


router.put('/:id', updateInvoice);

module.exports = router;
