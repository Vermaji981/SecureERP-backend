const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { employeeValidation } = require('../validators');
const { validate } = require('../middleware/validationMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'hr'), getEmployees);
router.get('/:id', authorizeRoles('admin', 'manager', 'hr'), getEmployeeById);
router.post('/', authorizeRoles('admin', 'hr'), employeeValidation, validate, createEmployee);
router.put('/:id', authorizeRoles('admin', 'hr'), updateEmployee);
router.delete('/:id', authorizeRoles('admin', 'hr'), deleteEmployee);

module.exports = router;
