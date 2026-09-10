const express = require('express');
const router = express.Router();
const { 
    getMyProfile, 
    getStudentById, 
    updateMyProfile, 
    getAllStudents, 
    updatePlacedStatus,
    uploadResume,
    getResume
} = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../utils/jwt');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Get all students (PO and Admin only)
router.get('/', authenticateToken, requireRole(['po', 'admin']), getAllStudents);

// Get current student profile
router.get('/profile', authenticateToken, requireRole(['student']), getMyProfile);

// Get student profile by ID (PO/Admin/Student themselves)
router.get('/:userId', authenticateToken, getStudentById);

// Create or update current student profile
router.post('/profile', authenticateToken, requireRole(['student']), updateMyProfile);

// PO or Admin updates student placement status
router.put('/:userId/status', authenticateToken, requireRole(['po', 'admin']), updatePlacedStatus);

// Student upload resume to S3
router.post('/resume/upload', authenticateToken, requireRole(['student']), upload.single('resume'), uploadResume);

// Secure resume download route (Accessible by student, PO, and Admin)
router.get('/:userId/resume', authenticateToken, getResume);

module.exports = router;
