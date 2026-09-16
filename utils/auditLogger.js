const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, action, module, targetId = '', description }) => {
  try {
    const user = req && req.user ? req.user._id : null;
    const userEmail = req && req.user ? req.user.email : 'System/Guest';
    const userRole = req && req.user ? req.user.role : 'system';
    const ipAddress = req ? req.ip || req.connection.remoteAddress || '' : '';

    await AuditLog.create({
      user,
      userEmail,
      userRole,
      action,
      module,
      targetId,
      description,
      ipAddress
    });
  } catch (err) {
    console.error('Audit Logging Error:', err.message);
  }
};

module.exports = logAudit;
