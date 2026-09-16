const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getCustomers);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getCustomerById);
router.post('/', authorizeRoles('admin', 'manager'), createCustomer);
router.put('/:id', authorizeRoles('admin', 'manager'), updateCustomer);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteCustomer);

module.exports = router;
