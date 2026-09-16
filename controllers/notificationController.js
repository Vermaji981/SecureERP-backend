const Notification = require('../models/Notification');

// @desc    Get user notifications based on role & user ID
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    const query = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: userRole },
        { recipientUser: userId }
      ]
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    await Notification.updateMany(
      {
        $or: [
          { recipientRole: 'all' },
          { recipientRole: userRole },
          { recipientUser: userId }
        ]
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};
