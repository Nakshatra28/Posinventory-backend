const StockMovement = require("../models/StockMovement");
const PurchaseOrder = require('../models/purchaseOrder');
const Product = require("../models/Product");

exports.createStockMovement = async (data) => {
  try {
    const movement = new StockMovement(data);
    await movement.save();
    return movement;
  } catch (error) {
    console.error("Stock Movement Error:", error);
    throw error;
  }
};


exports.getStockMovements = async (req, res) => {
  try {
    const { search = "", type = "" } = req.query;

    let filter = {};

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { referenceId: { $regex: search, $options: "i" } },
        { user: { $regex: search, $options: "i" } }
      ];
    }

    const movements = await StockMovement
      .find(filter)
      .sort({ date: -1 });

    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stock movements",
      error: error.message
    });
  }
};

exports.getStockSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // STOCK IN TODAY
    const stockInToday = await StockMovement.aggregate([
      { $match: { type: 'IN', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // STOCK OUT TODAY
    const stockOutToday = await StockMovement.aggregate([
      { $match: { type: 'OUT', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // ADJUSTMENTS TODAY
    const adjustmentsToday = await StockMovement.aggregate([
      { $match: { type: 'ADJUST', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // 🔥 PENDING STOCK (FROM PURCHASE ORDERS)
    const pendingPOs = await PurchaseOrder.find({
      status: { $in: ['pending', 'ordered'] }
    });

    let pendingStock = 0;
    pendingPOs.forEach(po => {
      po.items.forEach(item => {
        pendingStock += item.quantity;
      });
    });

    res.json({
      stockInToday: stockInToday[0]?.total || 0,
      stockOutToday: stockOutToday[0]?.total || 0,
      adjustmentsToday: adjustmentsToday[0]?.total || 0,
      pendingStock // ✅ THIS WAS MISSING
    });

  } catch (error) {
    console.error('Stock Summary Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { productId, quantity, reason, user } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product and quantity are required"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 🔥 update stock
    product.currentStock += quantity;
    await product.save();

    // 🔥 create stock movement
    await StockMovement.create({
      productId: product._id,
      productName: product.name,
      type: "ADJUST",
      quantity,
      referenceType: "manual",
      referenceId: reason || "manual-adjustment",
      user: user || "admin"
    });

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully"
    });

  } catch (error) {
    console.error("ADJUST STOCK ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


