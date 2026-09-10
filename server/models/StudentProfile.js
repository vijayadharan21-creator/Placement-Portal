const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    CGPA: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    skills: {
        type: [String],
        default: []
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    placedStatus: {
        type: String,
        enum: ['Placed', 'Unplaced'],
        default: 'Unplaced'
    },
    placedCompany: {
        type: String,
        default: ''
    },
    packageLPA: {
        type: Number,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
StudentProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
