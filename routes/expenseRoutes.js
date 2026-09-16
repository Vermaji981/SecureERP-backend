const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'accountant'), getExpenses);
router.post('/', authorizeRoles('admin', 'accountant'), createExpense);
router.put('/:id', authorizeRoles('admin', 'accountant'), updateExpense);
router.delete('/:id', authorizeRoles('admin', 'accountant'), deleteExpense);

module.exports = router;
