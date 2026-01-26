
const express = require('express');
const router = express.Router();

const {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

// POST Add new customer
router.post('/', createCustomer);

// GET Fetch customers
router.get('/', getAllCustomers);

router.put("/:id",updateCustomer)

//delete customer
router.delete("/",deleteCustomer)
module.exports = router;
