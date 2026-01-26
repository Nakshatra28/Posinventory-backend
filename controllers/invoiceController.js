  const Invoice =require("../models/Invoice");
  const Product = require("../models/Product")
  const logAction = require('../utils/auditLogger');


  const { createStockMovement } = require("./stockMovementController");


// CREATE INVOICE
exports.createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      tax = 0,
      discount = 0,
      paymentMethod,
      invoiceDate,
      dueDate
    } = req.body;

    // 1️⃣ Validation
    if (!customerName || !invoiceDate || !items || items.length === 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Required invoice data missing"
      });
    }

    let subTotal = 0;
    const invoiceItems = [];
    // invoice number FIRST
const invoiceNo = `INV-${Date.now()}`;

    // 2️⃣ Process items & stock
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

     if (product.currentStock < item.quantity) 
{
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = item.price * item.quantity;
      subTotal += itemTotal;

      invoiceItems.push({
        productId: product._id,
        productName: product.name,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal
      });

   product.currentStock -= item.quantity;
   
await product.save();
await createStockMovement({
  productId: product._id,
  productName: product.name,
  type: "OUT",
  quantity: item.quantity,
  referenceType: "invoice",
  referenceId: invoiceNo,
  user: "admin"
});

    }

    // 3️⃣ Totals
    const grandTotal = subTotal + tax - discount;

   

    // 5️⃣ CREATE INVOICE
    const invoice = await Invoice.create({
      invoiceNo,
      customerId,
      customerName,
      customerPhone,
      items: invoiceItems,
      subTotal,
      tax,
      discount,
      grandTotal,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      paymentMethod,
      invoiceDate,
      dueDate,
      createdBy: "admin"
    });

    // ✅ AUDIT LOG (CORRECT PLACE)
    await logAction({
      module: 'Invoice',
      action: 'CREATE',
      details: `Invoice ${invoice.invoiceNo} created for ${customerName}`,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });

  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating invoice"
    });
  }
};



  // Get all invoices
exports.getInvoice = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices
    });

  } catch (error) {
    console.error("Get Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices"
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No invoice IDs provided"
      });
    }

    await Invoice.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      success: true,
      message: "Invoice(s) deleted successfully"
    });

  } catch (error) {
    console.error("Delete Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, tax = 0, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice must have items"
      });
    }

    // 🔹 Recalculate subtotal
    const subTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const grandTotal = subTotal + tax - discount;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        ...req.body,
        subTotal,
        grandTotal
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice
    });

  } catch (error) {
    console.error("UPDATE INVOICE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


exports.getUnpaidInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      paymentStatus: { $in: ['unpaid', 'partial'] }
    })
    .select('_id invoiceNumber customerName totalAmount paidAmount paymentStatus')
    .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
