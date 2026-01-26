const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,  receivePurchaseOrder  ,getPendingStockCount
} = require("../controllers/purchaseOrderController");

// CREATE
router.post("/", createPurchaseOrder);

// READ
router.get("/", getPurchaseOrders);
router.get("/:id", getPurchaseOrderById);

// UPDATE
router.put("/:id", updatePurchaseOrder);

// DELETE
router.delete("/:id", deletePurchaseOrder);
router.put("/:id/receive", receivePurchaseOrder);
router.get('/pending/stock', getPendingStockCount);

module.exports = router;
