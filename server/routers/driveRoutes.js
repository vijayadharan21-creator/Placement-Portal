const express = require('express');
const router = express.Router();
const { createDrive, getAllDrives, getDriveById, updateDrive, deleteDrive } = require('../controllers/driveController');
const { authenticateToken, requireRole } = require('../utils/jwt');

// Get all drives (accessible to any logged-in user)
router.get('/', authenticateToken, getAllDrives);

// Get specific drive (accessible to any logged-in user)
router.get('/:id', authenticateToken, getDriveById);

// Create drive (PO/Admin only)
router.post('/', authenticateToken, requireRole(['po', 'admin']), createDrive);

// Update drive (PO/Admin only)
router.put('/:id', authenticateToken, requireRole(['po', 'admin']), updateDrive);

// Delete drive (PO/Admin only)
router.delete('/:id', authenticateToken, requireRole(['po', 'admin']), deleteDrive);

module.exports = router;
