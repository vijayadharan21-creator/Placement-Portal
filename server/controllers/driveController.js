const Drive = require('../models/Drive');
const Application = require('../models/Application');

// Create a new drive (PO/Admin only)
const createDrive = async (req, res) => {
    try {
        const { companyName, jobProfile, eligibilityCriteria, packageLPA, driveDate, skillsRequired, description, status } = req.body;

        if (!companyName || !jobProfile || eligibilityCriteria === undefined || !packageLPA || !driveDate) {
            return res.status(400).json({ message: 'Required fields: companyName, jobProfile, eligibilityCriteria, packageLPA, driveDate.' });
        }

        let parsedSkills = [];
        if (Array.isArray(skillsRequired)) {
            parsedSkills = skillsRequired;
        } else if (typeof skillsRequired === 'string') {
            parsedSkills = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
        }

        const drive = new Drive({
            companyName,
            jobProfile,
            eligibilityCriteria,
            packageLPA,
            driveDate,
            skillsRequired: parsedSkills,
            description,
            status: status || 'Upcoming'
        });

        await drive.save();
        res.status(201).json({ message: 'Recruitment drive created successfully.', drive });
    } catch (err) {
        console.error('CreateDrive Error:', err);
        res.status(500).json({ message: 'Error creating recruitment drive.' });
    }
};

// Get all drives (accessible by all logged-in users)
const getAllDrives = async (req, res) => {
    try {
        const drives = await Drive.find().sort({ driveDate: 1 });
        res.status(200).json({ drives });
    } catch (err) {
        console.error('GetAllDrives Error:', err);
        res.status(500).json({ message: 'Error retrieving drives.' });
    }
};

// Get specific drive details
const getDriveById = async (req, res) => {
    try {
        const { id } = req.params;
        const drive = await Drive.findById(id);
        if (!drive) {
            return res.status(404).json({ message: 'Drive not found.' });
        }
        res.status(200).json({ drive });
    } catch (err) {
        console.error('GetDriveById Error:', err);
        res.status(500).json({ message: 'Error retrieving drive details.' });
    }
};

// Update drive details (PO/Admin only)
const updateDrive = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, jobProfile, eligibilityCriteria, packageLPA, driveDate, skillsRequired, description, status } = req.body;

        const drive = await Drive.findById(id);
        if (!drive) {
            return res.status(404).json({ message: 'Drive not found.' });
        }

        if (companyName) drive.companyName = companyName;
        if (jobProfile) drive.jobProfile = jobProfile;
        if (eligibilityCriteria !== undefined) drive.eligibilityCriteria = eligibilityCriteria;
        if (packageLPA) drive.packageLPA = packageLPA;
        if (driveDate) drive.driveDate = driveDate;
        if (description !== undefined) drive.description = description;
        if (status) drive.status = status;
        
        if (skillsRequired !== undefined) {
            if (Array.isArray(skillsRequired)) {
                drive.skillsRequired = skillsRequired;
            } else if (typeof skillsRequired === 'string') {
                drive.skillsRequired = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        await drive.save();
        res.status(200).json({ message: 'Drive updated successfully.', drive });
    } catch (err) {
        console.error('UpdateDrive Error:', err);
        res.status(500).json({ message: 'Error updating drive details.' });
    }
};

// Delete drive (PO/Admin only)
const deleteDrive = async (req, res) => {
    try {
        const { id } = req.params;

        const drive = await Drive.findById(id);
        if (!drive) {
            return res.status(404).json({ message: 'Drive not found.' });
        }

        // Delete all applications related to this drive
        await Application.deleteMany({ driveId: id });
        await Drive.findByIdAndDelete(id);

        res.status(200).json({ message: 'Drive and its corresponding applications deleted successfully.' });
    } catch (err) {
        console.error('DeleteDrive Error:', err);
        res.status(500).json({ message: 'Error deleting drive.' });
    }
};

module.exports = {
    createDrive,
    getAllDrives,
    getDriveById,
    updateDrive,
    deleteDrive
};
