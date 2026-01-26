const AuditLog = require('../models/AuditLog');

const logAction = async ({
  module,
  action,
  details = '',
  user = 'System',
  ipAddress = '',
  status = 'SUCCESS'
}) => {
  try {
    await AuditLog.create({
      module,
      action,
      details,
      user,
      ipAddress,
      status
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = logAction;
