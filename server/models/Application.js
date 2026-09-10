const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drive',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a student can only apply to a specific drive once
ApplicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
