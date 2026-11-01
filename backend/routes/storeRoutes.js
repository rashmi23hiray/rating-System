const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Stores list for authenticated users
router.get('/stores', authenticateToken, storeController.getAllStoresForUser);

// Ratings submission (Normal User only)
router.post('/ratings', authenticateToken, requireRole('user'), storeController.submitOrUpdateRating);

// Store Owner dashboard (Store Owner only)
router.get('/owner/dashboard', authenticateToken, requireRole('owner'), storeController.getOwnerDashboard);

module.exports = router;
