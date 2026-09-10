const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Force role to student for self-registration
        const chosenRole = 'student';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: chosenRole
        });

        // Initialize empty StudentProfile if the registered user is a student
        if (chosenRole === 'student') {
            await StudentProfile.create({
                userId: user._id,
                rollNumber: 'ROLL-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                department: 'Not Specified',
                CGPA: 0,
                skills: [],
                resumeUrl: '',
                placedStatus: 'Unplaced'
            });
        }

        const token = generateToken(user);

        // Omit password from response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: userObj,
            token
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal Server Error during registration.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Login successful',
            user: userObj,
            token
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal Server Error during login.' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('GetMe Error:', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

const createPO = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'po'
        });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            message: 'Placement Officer account created successfully.',
            user: userObj
        });
    } catch (err) {
        console.error('CreatePO Error:', err);
        res.status(500).json({ message: 'Error creating Placement Officer account.' });
    }
};

const getPOs = async (req, res) => {
    try {
        const pos = await User.find({ role: 'po' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ pos });
    } catch (err) {
        console.error('GetPOs Error:', err);
        res.status(500).json({ message: 'Error retrieving Placement Officers.' });
    }
};

const deletePO = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOneAndDelete({ _id: id, role: 'po' });
        if (!user) {
            return res.status(404).json({ message: 'Placement Officer not found.' });
        }
        res.status(200).json({ message: 'Placement Officer deleted successfully.' });
    } catch (err) {
        console.error('DeletePO Error:', err);
        res.status(500).json({ message: 'Error deleting Placement Officer.' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    createPO,
    getPOs,
    deletePO
};
