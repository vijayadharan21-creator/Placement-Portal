const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../utils/jwt');

// Fetch aggregated dashboard metrics (PO and Admin only)
router.get('/stats', authenticateToken, requireRole(['po', 'admin']), getDashboardStats);

module.exports = router;
