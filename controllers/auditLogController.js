const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.module) {
      query.module = req.query.module;
    }
    if (req.query.action) {
      query.action = req.query.action;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { userEmail: searchRegex },
        { description: searchRegex },
        { action: searchRegex },
        { module: searchRegex }
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
      },
      data: logs
    });
  } catch (err) {
    next(err);
  }
};
