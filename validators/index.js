const { body } = require('express-validator');

exports.registerValidation = [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

exports.loginValidation = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists()
];

exports.productValidation = [
  body('productName', 'Product Name is required').notEmpty().trim(),
  body('SKU', 'SKU code is required').notEmpty().trim(),
  body('category', 'Category is required').notEmpty().trim(),
  body('purchasePrice', 'Purchase price must be a positive number').isNumeric(),
  body('sellingPrice', 'Selling price must be a positive number').isNumeric()
];

exports.employeeValidation = [
  body('employeeId', 'Employee ID is required').notEmpty().trim(),
  body('name', 'Employee Name is required').notEmpty().trim(),
  body('email', 'Valid email is required').isEmail().normalizeEmail(),
  body('phone', 'Phone number is required').notEmpty().trim(),
  body('department', 'Department is required').notEmpty()
];

exports.purchaseValidation = [
  body('supplier', 'Supplier is required').notEmpty(),
  body('items', 'Purchase items array is required').isArray({ min: 1 })
];

exports.saleValidation = [
  body('customer', 'Customer is required').notEmpty(),
  body('items', 'Sales items array is required').isArray({ min: 1 })
];
