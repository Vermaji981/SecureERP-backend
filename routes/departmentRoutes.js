const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'hr', 'accountant', 'employee'), getDepartments);
router.post('/', authorizeRoles('admin', 'hr'), createDepartment);
router.put('/:id', authorizeRoles('admin', 'hr'), updateDepartment);
router.delete('/:id', authorizeRoles('admin', 'hr'), deleteDepartment);

module.exports = router;
