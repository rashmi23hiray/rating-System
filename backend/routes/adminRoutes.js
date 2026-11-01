const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes require authentication and 'admin' role
router.use(authenticateToken, requireRole('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.addUser);
router.get('/stores', adminController.getStores);
router.post('/stores', adminController.addStore);

module.exports = router;
