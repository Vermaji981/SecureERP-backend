const express = require('express');
const router = express.Router();
const { getDashboardData, getDetailedReports } = require('../controllers/reportController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/dashboard', authorizeRoles('admin', 'manager', 'employee'), getDashboardData);
router.get('/detailed', authorizeRoles('admin', 'manager', 'accountant'), getDetailedReports);

module.exports = router;
