// server.js
const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
// Serves files directly from your root directory (DBMS copy)
app.use(express.static(__dirname));

let db;

// ── 1. INITIALIZE SQLITE DATABASE ─────────────────────────────────
// ── 1. INITIALIZE & AUTO-BUILD SQLITE DATABASE ─────────────────────
(async () => {
    try {
        db = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });
        console.log('✅ SQLite Database Connected.');

        // Enable foreign key support in SQLite (disabled by default)
        await db.run('PRAGMA foreign_keys = ON');

        // Create Tables structurally if they don't exist yet
        await db.exec(`
            CREATE TABLE IF NOT EXISTS departments (
                dept_id TEXT PRIMARY KEY,
                dept_name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS students (
                srn TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                dept_id TEXT,
                batch TEXT NOT NULL,
                academic_year TEXT NOT NULL,
                semester INTEGER NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
            );

            CREATE TABLE IF NOT EXISTS buildings (
                building_id INTEGER PRIMARY KEY AUTOINCREMENT,
                building_name TEXT NOT NULL,
                total_floors INTEGER DEFAULT 3
            );

            CREATE TABLE IF NOT EXISTS rooms (
                room_id INTEGER PRIMARY KEY AUTOINCREMENT,
                building_id INTEGER NOT NULL,
                room_number TEXT NOT NULL,
                floor_number TEXT NOT NULL,
                total_seats INTEGER DEFAULT 30,
                grid_rows INTEGER DEFAULT 5,
                grid_cols INTEGER DEFAULT 6,
                is_active INTEGER DEFAULT 1,
                UNIQUE(building_id, room_number),
                FOREIGN KEY (building_id) REFERENCES buildings(building_id)
            );

            CREATE TABLE IF NOT EXISTS blocked_seats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                seat_number INTEGER NOT NULL,
                reason TEXT DEFAULT 'Blocked by admin',
                blocked_by INTEGER NOT NULL,
                blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(room_id, seat_number),
                FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS exams (
                exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER NOT NULL,
                exam_date TEXT NOT NULL,
                exam_time TEXT NOT NULL,
                duration_mins INTEGER DEFAULT 180,
                academic_year TEXT NOT NULL,
                semester INTEGER NOT NULL,
                exam_type TEXT CHECK(exam_type IN ('CIE-1','CIE-2','SEE','Supplementary')) DEFAULT 'SEE',
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS exam_rooms (
                exam_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_id INTEGER NOT NULL,
                room_id INTEGER NOT NULL,
                invigilator_id INTEGER DEFAULT NULL,
                UNIQUE(exam_id, room_id),
                FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
                FOREIGN KEY (room_id) REFERENCES rooms(room_id)
            );

            CREATE TABLE IF NOT EXISTS seating_allocations (
                allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_room_id INTEGER NOT NULL,
                srn TEXT NOT NULL,
                seat_number INTEGER NOT NULL,
                allocated_by INTEGER NOT NULL,
                allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(exam_room_id, seat_number),
                UNIQUE(exam_room_id, srn),
                FOREIGN KEY (exam_room_id) REFERENCES exam_rooms(exam_room_id) ON DELETE CASCADE,
                FOREIGN KEY (srn) REFERENCES students(srn)
            );
        `);

        // Seed Core Data if the departments table is empty
        const deptCheck = await db.get('SELECT COUNT(*) as count FROM departments');
        if (deptCheck.count === 0) {
            console.log('🌱 Seed data missing. Populating database tables...');
            
            await db.run("INSERT INTO departments (dept_id, dept_name) VALUES ('CSE', 'Computer Science & Engineering'), ('ECE', 'Electronics & Communication Engineering'), ('AIML', 'Artificial Intelligence & Machine Learning')");
            await db.run("INSERT INTO buildings (building_name, total_floors) VALUES ('A Block', 12), ('B Block', 12),('C Block', 12)");
            await db.run("INSERT INTO rooms (building_id, room_number, floor_number) VALUES (1, '401', '4th Floor'), (1, '402', '4th Floor'), (1, '403', '4th Floor'),(1, '404', '4th Floor')");

            // Seed your sample students
            const studentSeeds = [
                ['24SUUBECS0001','Mohammed Zubair Ahmed','zubair.ahmed@surana.edu.in','9876543201','CSE','2024-28','2024-25',1],
                ['24SUUBECS0002','Priya Venkataraman','priya.venkat@surana.edu.in','9876543202','CSE','2024-28','2024-25',1],
                ['24SUUBECS0003','Akash Rajendra Patil','akash.patil@surana.edu.in','9876543203','CSE','2024-28','2024-25',1],
                ['24SUUBECS0004','Divya Suresh Nair','divya.nair@surana.edu.in','9876543204','CSE','2024-28','2024-25',1],
                ['24SUUBECS0005','Rohan Sanjay Kulkarni','rohan.kulkarni@surana.edu.in','9876543205','CSE','2024-28','2024-25',1]
            ];

            for (let s of studentSeeds) {
                await db.run(`INSERT INTO students (srn, full_name, email, phone, dept_id, batch, academic_year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, s);
            }
            console.log('✅ Database structures and student records seeded successfully.');
        }

    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
    }
})();

// ── 2. CORE API ENDPOINTS ─────────────────────────────────────────

// Fetch first 25 students
app.get('/api/data', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM students LIMIT 25');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update student contact details
app.post('/api/update', async (req, res) => {
    const { newPhone, srn } = req.body;
    try {
        const result = await db.run('UPDATE students SET phone = ? WHERE srn = ?', [newPhone, srn]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Student SRN not found." });
        }
        res.json({ message: "Student data updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── 3. EXAM SEATING ALLOCATION ENGINE (JS Port of Stored Procedure) ──
app.post('/api/allocate-seats', async (req, res) => {
    const { examId, roomId, srnFrom, srnTo, adminId } = req.body;

    if (!examId || !roomId || !srnFrom || !srnTo || !adminId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Find or create the exam_room mapping row
        let examRoom = await db.get(
            'SELECT exam_room_id FROM exam_rooms WHERE exam_id = ? AND room_id = ?', 
            [examId, roomId]
        );

        let examRoomId;
        if (!examRoom) {
            const result = await db.run(
                'INSERT INTO exam_rooms (exam_id, room_id) VALUES (?, ?)', 
                [examId, roomId]
            );
            examRoomId = result.lastID;
        } else {
            examRoomId = examRoom.exam_room_id;
        }

        // Clear existing allocations for this specific exam room layout
        await db.run('DELETE FROM seating_allocations WHERE exam_room_id = ?', [examRoomId]);

        // Parse out the numbers from the SRN string bounds (e.g., '24SUUBECS0001' -> 1)
        const startNum = parseInt(srnFrom.slice(-4), 10);
        const endNum = parseInt(srnTo.slice(-4), 10);
        const prefix = srnFrom.slice(0, -4);

        // Fetch all currently blocked seat indices for this room configuration
        const blockedRows = await db.all('SELECT seat_number FROM blocked_seats WHERE room_id = ?', [roomId]);
        const blockedSeats = new Set(blockedRows.map(row => row.seat_number));

        let currentSeat = 1;

        // Loop through the sequential student range sequence
        for (let i = startNum; i <= endNum; i++) {
            // Keep bumping the seat number forward if it hits an admin-blocked structure layout
            while (blockedSeats.has(currentSeat)) {
                currentSeat++;
            }

            // Build individual formatted string padding identifier back out
            const currentSrn = `${prefix}${String(i).padStart(4, '0')}`;

            // Save seat mapping record straight into SQLite matrix index
            await db.run(
                `INSERT OR IGNORE INTO seating_allocations 
                (exam_room_id, srn, seat_number, allocated_by) VALUES (?, ?, ?, ?)`,
                [examRoomId, currentSrn, currentSeat, adminId]
            );

            currentSeat++;
        }

        res.json({ success: true, message: "Exam seating rows allocated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch complete live room mapping grid tracking configuration
app.get('/api/seating-grid', async (req, res) => {
    try {
        const query = `
            SELECT 
                er.exam_room_id, r.room_number, sa.seat_number, s.srn, s.full_name AS student_name
            FROM rooms r
            JOIN exam_rooms er ON r.room_id = er.room_id
            LEFT JOIN seating_allocations sa ON er.exam_room_id = sa.exam_room_id
            LEFT JOIN students s ON sa.srn = s.srn
        `;
        const rows = await db.all(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── 4. START RUNNING ──────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Complete SQLite Server running on http://localhost:${PORT}`));