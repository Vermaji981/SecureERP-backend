const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'hr', 'manager', 'employee'), getAttendance);
router.get('/summary', authorizeRoles('admin', 'hr', 'manager'), getAttendanceSummary);
router.post('/', authorizeRoles('admin', 'hr', 'employee'), markAttendance);

module.exports = router;
