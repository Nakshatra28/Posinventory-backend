const express = require('express');
const router = express.Router();

const { getAuditLogs,exportAuditLogs } = require('../controllers/auditLogController');

router.get('/', getAuditLogs);

router.get('/export', exportAuditLogs);
module.exports = router;
