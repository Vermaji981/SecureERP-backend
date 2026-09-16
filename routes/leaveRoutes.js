const express = require('express');
const router = express.Router();
const { getLeaves, createLeave, approveLeave, rejectLeave, cancelLeave } = require('../controllers/leaveController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', getLeaves);
router.post('/', createLeave);
router.put('/:id/approve', authorizeRoles('admin', 'hr', 'manager'), approveLeave);
router.put('/:id/reject', authorizeRoles('admin', 'hr', 'manager'), rejectLeave);
router.put('/:id/cancel', cancelLeave);

module.exports = router;
