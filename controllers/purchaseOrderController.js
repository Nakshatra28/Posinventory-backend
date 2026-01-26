  const PurchaseOrder = require("../models/purchaseOrder");
  const Product = require("../models/Product");
  const { createStockMovement } = require("./stockMovementController");
  // ✅ Create Purchase Order
  exports.createPurchaseOrder = async (req, res) => {
    try {
      const po = await PurchaseOrder.create(req.body);

      res.status(201).json({
        success: true,
        message: "Purchase Order created successfully",
        data: po,
      });
    } catch (error) {
      console.error("❌ CREATE PO ERROR:", error); // 👈 ADD THIS

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // ✅ Get All Purchase Orders
  exports.getPurchaseOrders = async (req, res) => {
    try {
      const orders = await PurchaseOrder.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // ✅ Get Single PO
  exports.getPurchaseOrderById = async (req, res) => {
    try {
      const po = await PurchaseOrder.findById(req.params.id);

      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order not found",
        });
      }

      res.status(200).json({
        success: true,
        data: po,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };



  // ✅ Delete PO
  exports.deletePurchaseOrder = async (req, res) => {
    try {
      await PurchaseOrder.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Purchase Order deleted",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // UPDATE PO
  exports.updatePurchaseOrder = async (req, res) => {
    try {
      const updatedPO = await PurchaseOrder.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Purchase Order updated",
        data: updatedPO,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // ✅ RECEIVE PURCHASE ORDER (STOCK IN)
  exports.receivePurchaseOrder = async (req, res) => {
    try {
      const po = await PurchaseOrder.findById(req.params.id);

      if (!po) {
        return res.status(404).json({
          success: false,
          message: "Purchase Order not found"
        });
      }

      if (po.status === "received") {
        return res.status(400).json({
          success: false,
          message: "Purchase Order already received"
        });
      }

      for (const item of po.items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found for ${item.productName}`
          });
        }

        // 🔼 Increase stock
        product.currentStock += item.quantity;
        await product.save();

        // 🧾 Stock Movement (IN)
        await createStockMovement({
          productId: product._id,
          productName: product.name,
          type: "IN",
          quantity: item.quantity,
          referenceType: "purchase",
        referenceId: po.poNumber,
          user: "admin"
        });
      }

      // Mark PO as received
      po.status = "received";
      await po.save();

      res.status(200).json({
        success: true,
        message: "Purchase Order received successfully"
      });

    } catch (error) {
      console.error("❌ RECEIVE PO ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getLowStockCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({
      currentStock: { $lte: 5 }
    });

    res.status(200).json({
      lowStockCount: count
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getPendingStockCount = async (req, res) => {
  try {
    const pending = await PurchaseOrder.aggregate([
      {
        $match: {
          status: { $in: ["pending", "ordered"] }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$items.quantity" }
        }
      }
    ]);

    res.json({
      pendingStock: pending[0]?.totalQty || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getPendingStockCount = async (req, res) => {
  try {
    const pendingOrders = await PurchaseOrder.find({
      status: { $in: ['pending', 'ordered'] }
    });

    let pendingQty = 0;

    pendingOrders.forEach(po => {
      po.items.forEach(item => {
        pendingQty += item.quantity;
      });
    });

    res.json({ pendingStock: pendingQty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
