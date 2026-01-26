const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { from, to, module, page = 1, limit = 10 } = req.query;

    let filter = {};

    // Date filter
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // Module filter
    if (module && module !== 'All') {
      filter.module = module;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
      data: logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.exportAuditLogs = async (req, res) => {
  try {
    const { from, to, module } = req.query;

    let filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    if (module && module !== 'All') {
      filter.module = module;
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 });

    // CSV header
    let csv = 'Date,User,Module,Action,Status,Details,IP\n';

    logs.forEach(log => {
      csv += `"${log.createdAt.toISOString()}","${log.user}","${log.module}","${log.action}","${log.status}","${log.details || ''}","${log.ipAddress || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=audit-logs.csv'
    );

    res.status(200).send(csv);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
