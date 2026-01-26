const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getLowStockSummary
} = require("../controllers/productController");

// ➕ Add product
router.post("/add", addProduct);

// 📦 Get all products
router.get("/list", getProducts);

// 🗑️ Delete products
router.delete("/", deleteProduct);

// ✏️ Update product
router.put("/:id", updateProduct);

// ⚠️ Low stock summary (count + products)
router.get("/low-stock", getLowStockSummary);

module.exports = router;
