const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    jobProfile: {
        type: String,
        required: true,
        trim: true
    },
    eligibilityCriteria: {
        type: Number, // minimum CGPA required
        required: true,
        min: 0,
        max: 10
    },
    packageLPA: {
        type: Number,
        required: true
    },
    driveDate: {
        type: Date,
        required: true
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    applicantsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Drive', DriveSchema);
