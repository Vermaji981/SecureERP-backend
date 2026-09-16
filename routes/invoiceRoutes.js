const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById } = require('../controllers/invoiceController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getInvoices);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getInvoiceById);

module.exports = router;
