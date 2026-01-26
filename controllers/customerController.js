// controllers/customerController.js
const Customer = require('../models/Customer');

// Simple email validation
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----------------------
// CREATE CUSTOMER
// ----------------------
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address,status } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check duplicate email
    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    // Create and save customer
    const customer = new Customer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
     status: status || 'active'
    });

    await customer.save();

    return res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate email' });
    }
    next(err);
  }
};

// ----------------------
// GET ALL CUSTOMERS
// ----------------------
exports.getAllCustomers = async (req, res, next) => {
  try {
    const list = await Customer.find().sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    next(err);
  }
};


// exports.updateCustomer = async(req,res ,next ) =>{
//    try {
//       const { id } = req.params;
//       const body = req.body;
  
//       // 🔥 convert to numbers
//       const stock = Number(body.stock);
//       const minStock = Number(body.minStock);
  
//       // 🔥 auto-generate status
//       let status = "In Stock";
//       if (stock === 0) {
//         status = "Out of Stock";
//       } else if (stock <= minStock) {
//         status = "Low Stock";
//       }
  
//       console.log("UPDATE ID RECEIVED:", id);
  
//       const found = await Customer.findById(id);
//       if (!found) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found in database",
//         });
//       }
  
//       const updatedCustomer = await Customer.findByIdAndUpdate(
//         id,
//         {
//           ...body,
//           stock,
//           minStock,
//           status, // ✅ APPLY STATUS
//         },
//         { new: true }
//       );
  
//       res.status(200).json({
//         success: true,
//         message: "Customer updated successfully",
//         data: updatedCustomer,
//       });
  
//     } catch (err) {
//       console.error("UPDATE ERROR:", err);
//       res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
// }


exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const found = await Customer.findById(id);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: body.status, // ✅ Active / Inactive ONLY
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCustomer=async(req,res) =>{
  try{
    const { ids }=req.body;
    
    if(!ids || ids.length ===0){
      return res.status(400).json({
        success:false,
        message:"No Customer IDs provided"
      });
    }
    await Customer.deleteMany({
      _id: {$in: ids}
    });
    res.status(200).json({
      success:true,
      message:"Customer(s) deleted successfully"
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message:error.message
    });
  }
};  