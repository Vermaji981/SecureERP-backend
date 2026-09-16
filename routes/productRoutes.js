const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { productValidation } = require('../validators');
const { validate } = require('../middleware/validationMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager', 'accountant'), getProducts);
router.get('/:id', authorizeRoles('admin', 'manager', 'accountant'), getProductById);
router.post('/', authorizeRoles('admin', 'manager'), productValidation, validate, createProduct);
router.put('/:id', authorizeRoles('admin', 'manager'), updateProduct);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteProduct);

module.exports = router;
