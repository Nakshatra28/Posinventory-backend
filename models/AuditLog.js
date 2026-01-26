const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    user: {
      type: String,
      default: 'System'
    },
    ipAddress: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'SUCCESS'
    }
  },
  { timestamps: true } // 🔥 creates createdAt automatically
);

// ✅ prevent OverwriteModelError
module.exports =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
