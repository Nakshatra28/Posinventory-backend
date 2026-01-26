    const express =require('express');
    const router = express.Router();

    const{
        createSupplier,
        getAllSupplier,deleteSupplier,updateSupplier

    } =require('../controllers/supplierController');
    router.post('/', createSupplier);
    // GET Fetch customers  
    router.get('/', getAllSupplier);
// DELETE supplier (single / multiple)
router.delete("/", deleteSupplier);
router.put('/:id', updateSupplier);
    module.exports =router;