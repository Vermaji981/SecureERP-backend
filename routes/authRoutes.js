const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getAllUsers, updateUserByAdmin } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { registerValidation, loginValidation } = require('../validators');
const { validate } = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

// Admin-only user management routes
router.get('/users', authenticateUser, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id', authenticateUser, authorizeRoles('admin'), updateUserByAdmin);

module.exports = router;
