const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors()); 
app.use(express.json());

// --- 1. USER SCHEMA (Updated with Profile & Knowledge Graph) ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true }, 
    institute: String,
    location: String,
    phone: String,
    parentPhone: String,
    
    // Profile Preferences
    targetExam: { type: String, default: "JEE" },
    dailyGoal: { type: String, default: "8" },
    strength: { type: String, default: "" },
    weakness: { type: String, default: "" },

    // Knowledge Graph - Stores the Spaced Repetition Array
    // This allows the forgetting curve to sync across devices
    knowledgeGraph: { 
        type: Array, 
        default: [] 
    },

    // Timetable Storage
    timetableSlots: { 
        type: [{ start: String, end: String }], 
        default: [{ start: "09:00", end: "10:00" }, { start: "11:00", end: "12:00" }, { start: "14:00", end: "15:00" }] 
    },
    timetableData: { type: Map, of: String, default: {} }, 

    // Attendance
    attendanceStartDate: { type: String, default: "2026-01-01" },
    attendanceRecords: { type: Object, default: {} },

    // Tasks Array
    tasks: [{
        title: { type: String, required: true },
        startTimeMs: { type: Number, required: true },
        endTimeMs: { type: Number, required: true },
        status: { type: String, default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }]
}, { minimize: false });

const User = mongoose.model('User', UserSchema);

// --- 2. AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, fullName, institute, location, phone, parentPhone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, fullName, institute, location, phone, parentPhone, tasks: [] });
        await newUser.save();
        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) { res.status(500).json({ message: "Signup failed" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json({ message: "Login successful!", user: user.fullName, email: user.email });
    } catch (err) { res.status(500).json({ message: "Login error" }); }
});

// --- 3. PROFILE & KNOWLEDGE GRAPH ROUTES (NEW) ---

// Fetch Profile & Knowledge Graph
app.get('/api/userdata/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            profile: {
                fullName: user.fullName,
                exam: user.targetExam,
                dailyGoal: user.dailyGoal,
                strength: user.strength,
                weakness: user.weakness
            },
            knowledgeGraph: user.knowledgeGraph
        });
    } catch (err) { res.status(500).json({ message: "Fetch failed" }); }
});

// Sync Profile
app.post('/api/profile/sync', async (req, res) => {
    try {
        const { email, exam, dailyGoal, strength, weakness } = req.body;
        await User.findOneAndUpdate(
            { email },
            { $set: { targetExam: exam, dailyGoal, strength, weakness } }
        );
        res.status(200).json({ message: "Profile synced" });
    } catch (err) { res.status(400).json({ message: "Profile sync failed" }); }
});

// Sync Knowledge Graph (StudyTracker)
app.post('/api/knowledge-graph/sync', async (req, res) => {
    try {
        const { email, graph } = req.body;
        await User.findOneAndUpdate(
            { email },
            { $set: { knowledgeGraph: graph } }
        );
        res.status(200).json({ message: "Knowledge Graph synced" });
    } catch (err) { res.status(400).json({ message: "Graph sync failed" }); }
});

// --- 4. EXISTING ROUTES (Timetable, Attendance, Tasks) ---
// (Keep your existing GET/POST routes for timetable, attendance, and tasks here...)

// --- 5. SERVER CONFIG ---
mongoose.connect("mongodb://127.0.0.1:27017/studentDB")
    .then(() => console.log("Connected to MongoDB (studentDB)"))
    .catch(err => console.log("DB Error:", err));

app.listen(5000, () => console.log(`Server running on http://127.0.0.1:5000`));