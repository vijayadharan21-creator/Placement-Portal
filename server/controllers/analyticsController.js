const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Placed vs Unplaced Ratio
        const placementStatusRaw = await StudentProfile.aggregate([
            {
                $group: {
                    _id: "$placedStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        let placementRatio = { Placed: 0, Unplaced: 0, Total: 0 };
        placementStatusRaw.forEach(item => {
            if (item._id === 'Placed') placementRatio.Placed = item.count;
            if (item._id === 'Unplaced') placementRatio.Unplaced = item.count;
            placementRatio.Total += item.count;
        });

        // 2. Department Placement Breakdown
        const deptRaw = await StudentProfile.aggregate([
            {
                $group: {
                    _id: { department: "$department", placedStatus: "$placedStatus" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Process deptRaw into: { department: 'CSE', Placed: X, Unplaced: Y }
        const deptMap = {};
        deptRaw.forEach(item => {
            const dept = item._id.department || 'Not Specified';
            const status = item._id.placedStatus;
            const count = item.count;

            if (!deptMap[dept]) {
                deptMap[dept] = { department: dept, Placed: 0, Unplaced: 0 };
            }
            deptMap[dept][status] = count;
        });
        const departmentStats = Object.values(deptMap);

        // 3. Salary Package Statistics
        const packageRaw = await StudentProfile.aggregate([
            { $match: { placedStatus: "Placed", packageLPA: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    averagePackage: { $avg: "$packageLPA" },
                    highestPackage: { $max: "$packageLPA" },
                    lowestPackage: { $min: "$packageLPA" }
                }
            }
        ]);

        const salaryStats = packageRaw[0] ? {
            averagePackage: Math.round(packageRaw[0].averagePackage * 100) / 100,
            highestPackage: packageRaw[0].highestPackage,
            lowestPackage: packageRaw[0].lowestPackage
        } : {
            averagePackage: 0,
            highestPackage: 0,
            lowestPackage: 0
        };

        // 4. Drive Stat Totals (Upcoming, Ongoing, Completed)
        const drivesCountRaw = await Drive.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const drivesStats = { Upcoming: 0, Ongoing: 0, Completed: 0, Total: 0 };
        drivesCountRaw.forEach(item => {
            if (drivesStats.hasOwnProperty(item._id)) {
                drivesStats[item._id] = item.count;
            }
            drivesStats.Total += item.count;
        });

        // 5. Top Hiring Companies
        const topCompanies = await StudentProfile.aggregate([
            { $match: { placedStatus: "Placed", placedCompany: { $ne: "" } } },
            {
                $group: {
                    _id: "$placedCompany",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    companyName: "$_id",
                    placedCount: "$count",
                    _id: 0
                }
            }
        ]);

        // 6. Global Stats Counts
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalDrives = await Drive.countDocuments();
        const totalPOs = await User.countDocuments({ role: 'po' });

        res.status(200).json({
            counts: {
                totalStudents,
                totalDrives,
                totalPOs
            },
            placementRatio,
            departmentStats,
            salaryStats,
            drivesStats,
            topCompanies
        });

    } catch (err) {
        console.error('GetDashboardStats Error:', err);
        res.status(500).json({ message: 'Error aggregating dashboard stats.' });
    }
};

module.exports = {
    getDashboardStats
};
