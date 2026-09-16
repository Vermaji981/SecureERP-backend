const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['all', 'admin', 'manager', 'hr', 'accountant', 'employee'],
      default: 'all'
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
