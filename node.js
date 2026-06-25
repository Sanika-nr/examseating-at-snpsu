const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to the live database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // 💡 Put your real MySQL password here if you have one
    database: 'exam_seating_db' // Kept exactly as exam_seating_db
});

// 2. Fetch all rows from your real 'students' table
app.get('/api/data', (req, res) => {
    // Changed 'your_table' to 'students'
    db.query('SELECT * FROM students LIMIT 25', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Update a student's phone number using their unique SRN
app.post('/api/update', (req, res) => {
    const { newPhone, srn } = req.body;
    
    // Changed placeholders to match your real students table column fields
    db.query('UPDATE students SET phone = ? WHERE srn = ?', [newPhone, srn], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student data updated successfully!" });
    });
});

app.listen(5000, () => console.log('✅ Small server running on port 5000'));