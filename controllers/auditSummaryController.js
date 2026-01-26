const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

exports.getAuditSummaryCards = async (req, res) => {
  try {
    // 🔹 TOTAL SALES
    const totalSalesAgg = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    // 🔹 OUTSTANDING PAYMENT
    const outstandingAgg = await Invoice.aggregate([
      { $match: { paymentStatus: { $ne: "paid" } } },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $subtract: ["$grandTotal", "$paidAmount"] }
          }
        }
      }
    ]);

    // 🔹 TOTAL STOCK VALUE
    const stockValueAgg = await Product.aggregate([
      {
        $project: {
          value: { $multiply: ["$stock", "$price"] }
        }
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    // 🔹 ACTIVE CUSTOMERS
    const activeCustomers = await Customer.countDocuments({ status: 'active' });

    // 🔹 CATEGORY-WISE STOCK VALUE (🔥 NEW)
    const categoryStockAgg = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          total: {
            $sum: { $multiply: ["$stock", "$price"] }
          }
        }
      }
    ]);

    // Convert aggregation result to object
    const categoryStock = {};
    categoryStockAgg.forEach(item => {
      categoryStock[item._id || 'Uncategorized'] = item.total;
    });

    // 🔹 FINAL RESPONSE
    res.json({
      totalSales: totalSalesAgg[0]?.total || 0,
      stockValue: stockValueAgg[0]?.total || 0,
      outstandingPayment: outstandingAgg[0]?.total || 0,
      activeCustomers,
      categoryStock // 👈 THIS FIXES THE DONUT CHART
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
