const express = require('express');
const router = express.Router();
const { applyToDrive, getStudentApplications, getDriveApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../utils/jwt');

// Apply to a drive (Student only)
router.post('/apply', authenticateToken, requireRole(['student']), applyToDrive);

// Get student's application history (Student only)
router.get('/student', authenticateToken, requireRole(['student']), getStudentApplications);

// Get candidates for a specific drive (PO/Admin only)
router.get('/drive/:driveId', authenticateToken, requireRole(['po', 'admin']), getDriveApplications);

// Update application status (PO/Admin only)
router.put('/:id/status', authenticateToken, requireRole(['po', 'admin']), updateApplicationStatus);

module.exports = router;
