const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);

module.exports = router;
