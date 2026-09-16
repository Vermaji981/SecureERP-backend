const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getSuppliers);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getSupplierById);
router.post('/', authorizeRoles('admin', 'manager'), createSupplier);
router.put('/:id', authorizeRoles('admin', 'manager'), updateSupplier);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteSupplier);

module.exports = router;
