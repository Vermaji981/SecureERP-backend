const express = require('express');
const router = express.Router();
const { getPurchases, getPurchaseById, createPurchase, cancelPurchase } = require('../controllers/purchaseController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { purchaseValidation } = require('../validators');
const { validate } = require('../middleware/validationMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getPurchases);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getPurchaseById);
router.post('/', authorizeRoles('admin', 'manager', 'accountant'), purchaseValidation, validate, createPurchase);
router.put('/:id/cancel', authorizeRoles('admin', 'manager'), cancelPurchase);

module.exports = router;
