const express = require('express');
const router = express.Router();
const { getPayroll, createPayroll, updatePayrollStatus } = require('../controllers/payrollController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'accountant', 'hr'), getPayroll);
router.post('/', authorizeRoles('admin', 'accountant'), createPayroll);
router.put('/:id', authorizeRoles('admin', 'accountant'), updatePayrollStatus);

module.exports = router;
