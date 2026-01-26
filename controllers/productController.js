const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
     console.log("REQUEST RECEIVED:", req.body);  
  try {
    const body =req.body;
     
    //auto generate status based on stock & minstock
    let status ="In Stock";
    if(body.stock===0){
        status="Out of Stock";

    }else if (body.stock <=body.minStock){
        status ="Low Stock";
    }


  const product = await Product.create({
  ...req.body,   // <-- correctly spread fields
  status: status
});

    res.status(201).json({
      success: true,
      message: "Product added Succesfully",
      data: product,
    });
  } catch (error) {
     console.log("BACKEND ERROR:", error);  
    res.status(500).json({
        
      success: false,
      message: error.message,
    });
  }
};

// get all product

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mesage: error.message,
    });
  }
};
exports.deleteProduct=async(req,res) =>{
  try{
    const { ids }=req.body;
    
    if(!ids || ids.length === 0) {
      return res.status(400).json({
        success:false,
        message:"No product IDs provided"
      });
    }
    await Product.deleteMany({
      _id: {$in: ids}
    });
    res.status(200).json({
      success:true,
      message:"Product(s) deleted successfully"
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message:error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // 🔥 convert to numbers
    const stock = Number(body.stock);
    const minStock = Number(body.minStock);

    // 🔥 auto-generate status
    let status = "In Stock";
    if (stock === 0) {
      status = "Out of Stock";
    } else if (stock <= minStock) {
      status = "Low Stock";
    }

    console.log("UPDATE ID RECEIVED:", id);

    const found = await Product.findById(id);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Product not found in database",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...body,
        stock,
        minStock,
        status, // ✅ APPLY STATUS
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




exports.getLowStockSummary = async (req, res) => {
  try {
    const products = await Product.find();

    const lowStockProducts = products.filter(
      p => p.stock <= p.minStock
    );

    res.json({
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// exports.getLowStockProducts = async (req, res) => {
//   try {
//     const products = await Product.find();

//     const lowStock = products.filter(
//       p => p.stock <= p.minStock
//     );

//     res.json(lowStock);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

