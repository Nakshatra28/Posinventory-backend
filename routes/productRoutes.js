const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getLowStockSummary
} = require("../controllers/productController");


router.post("/add", authMiddleware, adminMiddleware, addProduct);

router.get("/list", authMiddleware, getProducts);

router.delete("/", authMiddleware, adminMiddleware, deleteProduct);

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.get("/low-stock", authMiddleware, adminMiddleware, getLowStockSummary);

module.exports = router;
