const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userEmail: {
      type: String,
      default: 'System'
    },
    userRole: {
      type: String,
      default: 'system'
    },
    action: {
      type: String,
      required: true
    },
    module: {
      type: String,
      required: true
    },
    targetId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
