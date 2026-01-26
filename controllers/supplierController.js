const Supplier = require('../models/Supplier');


function isValidEmail(email){
      return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}



exports.createSupplier = async(req,res,next) =>{
    try{
        const {name,email,phone,contactPerson,status}= req.body;

        if(!name || !email){
  return res.status(400).json({ error: 'Name and email are required.' });
        }
 
        if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
        const existing =await Supplier.findOne({email:email.toLowerCase().trim()});
        if (existing){
                  return res.status(409).json({ error: 'Email already exists.' });

        }

        const supplier =new Supplier ({
            name : name.trim(),
            email : email.trim().toLowerCase(),
            phone: phone?.trim() ||'',
            contactPerson: contactPerson?.trim() || '',   // 🔥 ADD THIS
            status:status || 'active'
        });


        await supplier.save();

        return res.status(201).json({
            message:'supplier created successfully',
            supplier
        });

       }catch(err){
        if(err.code === 11000){
             return res.status(409).json({ error: 'Duplicate email' });
        }
        next(err);
       }
};

exports.getAllSupplier = async(req,res,next) => {
   try{
    const list = await Supplier.find().sort({ createdAt: -1}).limit(100);
    res.json(list);

   }catch(err){
    next(err);
   }
};





exports.deleteSupplier = async (req, res) => {
  try {
    console.log('--- DELETE SUPPLIER HIT ---');
    console.log('REQ HEADERS:', req.headers);
    console.log('REQ BODY:', req.body);

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      console.log('❌ IDS INVALID:', ids);
      return res.status(400).json({
        success: false,
        message: 'Invalid ids',
      });
    }

    const result = await Supplier.deleteMany({
      _id: { $in: ids },
    });

    console.log('DELETE RESULT:', result);

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('🔥 REAL ERROR:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, contactPerson } = req.body;

    const updated = await Supplier.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        contactPerson, // 🔥 IMPORTANT
        status
      },
      { new: true }
    );

    res.json({
      success: true,
      supplier: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
