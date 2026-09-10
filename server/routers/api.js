const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const driveRoutes = require('./driveRoutes');
const applicationRoutes = require('./applicationRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/drives', driveRoutes);
router.use('/applications', applicationRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
