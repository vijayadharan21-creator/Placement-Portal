const express = require('express');
const router = express.Router();
const { register, login, getMe, createPO, getPOs, deletePO } = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../utils/jwt');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Admin-only endpoints to manage Placement Officers (POs)
router.post('/create-po', authenticateToken, requireRole(['admin']), createPO);
router.get('/pos', authenticateToken, requireRole(['admin']), getPOs);
router.delete('/pos/:id', authenticateToken, requireRole(['admin']), deletePO);

module.exports = router;
