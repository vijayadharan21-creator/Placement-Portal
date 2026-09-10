const Application = require('../models/Application');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');

// Student applies to a drive (verifies CGPA eligibility first)
const applyToDrive = async (req, res) => {
    try {
        const { driveId } = req.body;
        const studentId = req.user.id;

        if (!driveId) {
            return res.status(400).json({ message: 'Drive ID is required.' });
        }

        // Fetch student profile to check CGPA & profile completion
        const profile = await StudentProfile.findOne({ userId: studentId });
        if (!profile || profile.rollNumber.startsWith('TEMP-') || profile.department === 'Not Specified') {
            return res.status(400).json({ message: 'Please complete your student profile first (Roll Number, Department, and CGPA are required).' });
        }

        // Fetch company drive details
        const drive = await Drive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: 'Recruitment drive not found.' });
        }

        // Check if drive is still open (Completed drives cannot be applied to)
        if (drive.status === 'Completed') {
            return res.status(400).json({ message: 'This placement drive has already completed and is closed for applications.' });
        }

        // Verify eligibility criteria (CGPA)
        if (profile.CGPA < drive.eligibilityCriteria) {
            return res.status(400).json({ 
                message: `You are not eligible. Your CGPA (${profile.CGPA}) is below the required minimum (${drive.eligibilityCriteria}).` 
            });
        }

        // Verify if student already applied
        const existingApp = await Application.findOne({ studentId, driveId });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied to this drive.' });
        }

        // Create the application
        const application = new Application({
            studentId,
            driveId,
            status: 'Applied'
        });

        await application.save();

        // Increment drive's applicants count
        drive.applicantsCount = (drive.applicantsCount || 0) + 1;
        await drive.save();

        res.status(201).json({ message: 'Application submitted successfully.', application });
    } catch (err) {
        console.error('ApplyToDrive Error:', err);
        res.status(500).json({ message: 'Error submitting application.' });
    }
};

// Get current student's application history
const getStudentApplications = async (req, res) => {
    try {
        const studentId = req.user.id;
        const applications = await Application.find({ studentId })
            .populate('driveId')
            .sort({ appliedAt: -1 });

        res.status(200).json({ applications });
    } catch (err) {
        console.error('GetStudentApplications Error:', err);
        res.status(500).json({ message: 'Error fetching application history.' });
    }
};

// Get all applications for a specific drive (PO/Admin only)
const getDriveApplications = async (req, res) => {
    try {
        const { driveId } = req.params;

        const drive = await Drive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: 'Drive not found.' });
        }

        const applications = await Application.find({ driveId })
            .populate('studentId', 'name email')
            .sort({ appliedAt: -1 });

        // Retrieve academic details (CGPA, rollNumber, department) for each applicant
        const detailedApplications = await Promise.all(applications.map(async (app) => {
            const profile = await StudentProfile.findOne({ userId: app.studentId._id });
            const appObj = app.toObject();
            appObj.profile = profile || null;
            return appObj;
        }));

        res.status(200).json({ applications: detailedApplications });
    } catch (err) {
        console.error('GetDriveApplications Error:', err);
        res.status(500).json({ message: 'Error retrieving candidates for drive.' });
    }
};

// Update status of candidate application (PO/Admin only)
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Applied', 'Shortlisted', 'Selected', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid application status value.' });
        }

        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application record not found.' });
        }

        application.status = status;
        await application.save();

        // If the candidate is "Selected", update their student profile placement status automatically
        if (status === 'Selected') {
            const drive = await Drive.findById(application.driveId);
            if (drive) {
                await StudentProfile.findOneAndUpdate(
                    { userId: application.studentId },
                    {
                        placedStatus: 'Placed',
                        placedCompany: drive.companyName,
                        packageLPA: drive.packageLPA
                    }
                );
            }
        } else if (status === 'Rejected' || status === 'Applied' || status === 'Shortlisted') {
            // If changed away from selected, verify if they are still placed under this drive
            const drive = await Drive.findById(application.driveId);
            if (drive) {
                // If they were placed in this company, reset to Unplaced
                const profile = await StudentProfile.findOne({ userId: application.studentId });
                if (profile && profile.placedCompany === drive.companyName) {
                    profile.placedStatus = 'Unplaced';
                    profile.placedCompany = '';
                    profile.packageLPA = null;
                    await profile.save();
                }
            }
        }

        res.status(200).json({ message: `Application status updated to ${status}.`, application });
    } catch (err) {
        console.error('UpdateApplicationStatus Error:', err);
        res.status(500).json({ message: 'Error updating application status.' });
    }
};

module.exports = {
    applyToDrive,
    getStudentApplications,
    getDriveApplications,
    updateApplicationStatus
};
