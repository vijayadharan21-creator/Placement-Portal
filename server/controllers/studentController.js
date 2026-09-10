const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { uploadBufferToS3, getPresignedUrl } = require('../utils/s3');

// Fetch profile of the logged-in student
const getMyProfile = async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role');
        if (!profile) {
            // Fallback in case profile wasn't created during registration
            profile = await StudentProfile.create({
                userId: req.user.id,
                rollNumber: 'ROLL-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                department: 'Not Specified',
                CGPA: 0,
                skills: [],
                resumeUrl: '',
                placedStatus: 'Unplaced'
            });
            profile = await profile.populate('userId', 'name email role');
        }
        res.status(200).json({ profile });
    } catch (err) {
        console.error('GetMyProfile Error:', err);
        res.status(500).json({ message: 'Error retrieving profile.' });
    }
};

// Fetch specific student profile (accessible by PO and Admin)
const getStudentById = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role');
        if (!profile) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }
        res.status(200).json({ profile });
    } catch (err) {
        console.error('GetStudentById Error:', err);
        res.status(500).json({ message: 'Error retrieving student profile.' });
    }
};

// Create or Update student profile
const updateMyProfile = async (req, res) => {
    try {
        const { rollNumber, department, CGPA, skills, resumeUrl } = req.body;

        if (!rollNumber || !department || CGPA === undefined) {
            return res.status(400).json({ message: 'Roll number, department, and CGPA are required.' });
        }

        // Check if roll number is already taken by another student
        const rollConflict = await StudentProfile.findOne({ rollNumber, userId: { $ne: req.user.id } });
        if (rollConflict) {
            return res.status(400).json({ message: 'Roll number is already in use by another student.' });
        }

        let parsedSkills = [];
        if (Array.isArray(skills)) {
            parsedSkills = skills;
        } else if (typeof skills === 'string') {
            parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        let profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = new StudentProfile({
                userId: req.user.id,
                rollNumber,
                department,
                CGPA,
                skills: parsedSkills,
                resumeUrl,
                placedStatus: 'Unplaced'
            });
        } else {
            profile.rollNumber = rollNumber;
            profile.department = department;
            profile.CGPA = CGPA;
            profile.skills = parsedSkills;
            profile.resumeUrl = resumeUrl;
        }

        await profile.save();
        const populatedProfile = await profile.populate('userId', 'name email role');

        res.status(200).json({
            message: 'Profile updated successfully',
            profile: populatedProfile
        });
    } catch (err) {
        console.error('UpdateMyProfile Error:', err);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

// Get all students with dynamic filtering (PO/Admin)
const getAllStudents = async (req, res) => {
    try {
        const { cgpa, skills, placedStatus, department, search } = req.query;
        let matchStage = {};

        if (cgpa) {
            matchStage.CGPA = { $gte: parseFloat(cgpa) };
        }
        if (placedStatus) {
            matchStage.placedStatus = placedStatus;
        }
        if (department) {
            matchStage.department = new RegExp(department, 'i');
        }
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsArray.length > 0) {
                // Find profiles containing ALL requested skills (case-insensitive)
                matchStage.skills = { 
                    $all: skillsArray.map(skill => new RegExp('^' + skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')) 
                };
            }
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'userInfo.name': new RegExp(search, 'i') },
                        { 'userInfo.email': new RegExp(search, 'i') },
                        { rollNumber: new RegExp(search, 'i') }
                    ]
                }
            });
        }

        // Project clean structure
        pipeline.push({
            $project: {
                _id: 1,
                userId: 1,
                rollNumber: 1,
                department: 1,
                CGPA: 1,
                skills: 1,
                resumeUrl: 1,
                placedStatus: 1,
                placedCompany: 1,
                packageLPA: 1,
                updatedAt: 1,
                name: '$userInfo.name',
                email: '$userInfo.email'
            }
        });

        const students = await StudentProfile.aggregate(pipeline);
        res.status(200).json({ students });
    } catch (err) {
        console.error('GetAllStudents Error:', err);
        res.status(500).json({ message: 'Error retrieving student profiles.' });
    }
};

// Update placed status (PO / Admin only)
const updatePlacedStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { placedStatus, placedCompany, packageLPA } = req.body;

        if (!['Placed', 'Unplaced'].includes(placedStatus)) {
            return res.status(400).json({ message: 'Invalid placedStatus value.' });
        }

        const profile = await StudentProfile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }

        profile.placedStatus = placedStatus;
        profile.placedCompany = placedStatus === 'Placed' ? placedCompany : '';
        profile.packageLPA = placedStatus === 'Placed' ? packageLPA : null;

        await profile.save();
        res.status(200).json({ message: 'Student placement status updated successfully.', profile });
    } catch (err) {
        console.error('UpdatePlacedStatus Error:', err);
        res.status(500).json({ message: 'Error updating placement status.' });
    }
};

// Upload resume to S3 and save to MongoDB
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Upload file to S3
        const result = await uploadBufferToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

        // Find or create profile
        let profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) {
            profile = new StudentProfile({
                userId: req.user.id,
                rollNumber: 'ROLL-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                department: 'Not Specified',
                CGPA: 0,
                skills: [],
                resumeUrl: result.url,
                placedStatus: 'Unplaced'
            });
        } else {
            profile.resumeUrl = result.url;
        }

        await profile.save();
        
        res.status(200).json({
            message: 'Resume uploaded successfully to S3 and updated profile.',
            resumeUrl: result.url,
            profile
        });
    } catch (err) {
        console.error('UploadResume Error:', err);
        res.status(500).json({ message: 'Error uploading resume to S3.' });
    }
};

// Retrieve secure resume presigned URL and redirect
const getResume = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const profile = await StudentProfile.findOne({ userId });
        if (!profile || !profile.resumeUrl) {
            return res.status(404).json({ message: 'Resume not found for this student.' });
        }

        // Verify if it is an S3 link by checking for amazonaws.com
        if (profile.resumeUrl.includes('.amazonaws.com/')) {
            // Extract the key from the url
            const parts = profile.resumeUrl.split('.amazonaws.com/');
            const key = parts[1];

            // Generate presigned URL
            const presignedUrl = await getPresignedUrl(key);
            return res.redirect(presignedUrl);
        }

        // Fallback if it's an external link (Google Drive, Cloudinary, etc.)
        res.redirect(profile.resumeUrl);
    } catch (err) {
        console.error('GetResume Error:', err);
        res.status(500).json({ message: 'Error retrieving resume URL.' });
    }
};

module.exports = {
    getMyProfile,
    getStudentById,
    updateMyProfile,
    getAllStudents,
    updatePlacedStatus,
    uploadResume,
    getResume
};
