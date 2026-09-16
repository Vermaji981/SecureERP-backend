const express = require('express');
const router = express.Router();
const { getInventoryOverview, adjustInventory } = require('../controllers/inventoryController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'manager'), getInventoryOverview);
router.post('/adjust', authorizeRoles('admin', 'manager'), adjustInventory);

module.exports = router;
