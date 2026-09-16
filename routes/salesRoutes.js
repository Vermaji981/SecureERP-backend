const express = require('express');
const router = express.Router();
const { getSales, getSaleById, createSale, cancelSale } = require('../controllers/salesController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { saleValidation } = require('../validators');
const { validate } = require('../middleware/validationMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getSales);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getSaleById);
router.post('/', authorizeRoles('admin', 'manager', 'accountant'), saleValidation, validate, createSale);
router.put('/:id/cancel', authorizeRoles('admin', 'manager'), cancelSale);

module.exports = router;
