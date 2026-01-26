const express = require("express");
const router = express.Router();

const {
  getStockMovements,
  getStockSummary,adjustStock
} = require("../controllers/stockMovementController");

// UI routes
router.get("/", getStockMovements); 
router.get("/summary", getStockSummary);
router.post("/adjust", adjustStock);

module.exports = router;
