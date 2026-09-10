const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const seedDefaultAdmin = async () => {
    try {
        const adminEmail = 'vijayadharan21@gmail.com';
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            console.log("Seeding default Admin account...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('12345678', salt);
            await User.create({
                name: 'Vijayadharan',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log("Default Admin account seeded successfully.");
        } else if (admin.role !== 'admin') {
            console.log("Enforcing Admin role on existing account...");
            admin.role = 'admin';
            await admin.save();
            console.log("Default Admin role enforced successfully.");
        } else {
            console.log("Default Admin account already exists with admin role.");
        }
    } catch (err) {
        console.error("Error seeding default Admin:", err);
    }
};

const DBConnect = async () => {
    const atlasUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://127.0.0.1:27017/placement';

    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 5000 });
        console.log("Database Connected to MongoDB Atlas Successfully");
        await seedDefaultAdmin();
    } catch (e) {
        console.warn("MongoDB Atlas connection failed:", e.message);
        console.log("Falling back to Local MongoDB...");
        try {
            await mongoose.connect(localUri);
            console.log("Database Connected to Local MongoDB Successfully");
            await seedDefaultAdmin();
        } catch (localErr) {
            console.error("Local MongoDB connection also failed:", localErr.message);
            process.exit(1);
        }
    }
}
const DBDisconnect = async () => {
    await mongoose.disconnect();
    console.log("Disconnected")
}
module.exports = { DBConnect, DBDisconnect }

