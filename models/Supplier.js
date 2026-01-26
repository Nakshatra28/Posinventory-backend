    const mongoose = require('mongoose');

    const supplierSchema =new mongoose.Schema({
        name: { type: String, required: true, trim: true, minlength: 1 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, trim: true, default: '' },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    contactPerson: String, 
    },{ versionKey: false });

    module.exports =mongoose.model('Supplier',supplierSchema);