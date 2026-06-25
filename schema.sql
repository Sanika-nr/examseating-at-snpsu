PRAGMA foreign_keys = ON;

-- Departments
CREATE TABLE departments (
    dept_id TEXT PRIMARY KEY,
    dept_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    dept_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Students
CREATE TABLE students (
    srn TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    dept_id TEXT NOT NULL,
    batch TEXT,
    academic_year TEXT,
    semester INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Subjects
CREATE TABLE subjects (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_code TEXT UNIQUE NOT NULL,
    subject_name TEXT NOT NULL,
    dept_id TEXT NOT NULL,
    semester INTEGER,
    credits INTEGER DEFAULT 4,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Buildings
CREATE TABLE IF NOT EXISTS buildings (
    building_id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_name TEXT NOT NULL,
    total_floors INTEGER DEFAULT 1
);

-- Rooms
CREATE TABLE IF NOT EXISTS  rooms (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    floor_number TEXT,
    total_seats INTEGER DEFAULT 30,
    grid_rows INTEGER DEFAULT 5,
    grid_cols INTEGER DEFAULT 6,
    is_active INTEGER DEFAULT 1,
    UNIQUE(building_id, room_number),
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    exam_date TEXT NOT NULL,
    exam_time TEXT NOT NULL,
    duration_mins INTEGER DEFAULT 180,
    academic_year TEXT,
    semester INTEGER,
    exam_type TEXT DEFAULT 'SEE',
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Exam Rooms
CREATE TABLE exam_rooms (
    exam_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    invigilator_id INTEGER,
    UNIQUE(exam_id, room_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (invigilator_id) REFERENCES users(user_id)
);

-- Seating Allocations
CREATE TABLE IF NOT EXISTS seating_allocations (
    allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_room_id INTEGER NOT NULL,
    srn TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    allocated_by INTEGER,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_room_id, seat_number),
    UNIQUE(exam_room_id, srn),
    FOREIGN KEY (exam_room_id) REFERENCES exam_rooms(exam_room_id),
    FOREIGN KEY (srn) REFERENCES students(srn),
    FOREIGN KEY (allocated_by) REFERENCES users(user_id)
);

-- Attendance
CREATE TABLE attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    allocation_id INTEGER UNIQUE NOT NULL,
    status TEXT DEFAULT 'present',
    malpractice_note TEXT,
    marked_by INTEGER,
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allocation_id) REFERENCES seating_allocations(allocation_id),
    FOREIGN KEY (marked_by) REFERENCES users(user_id)
);

-- Blocked Seats
CREATE TABLE IF NOT EXISTS  blocked_seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    reason TEXT,
    blocked_by INTEGER NOT NULL,
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, seat_number),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (blocked_by) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX idx_students_dept ON students(dept_id);
CREATE INDEX idx_exam_date ON exams(exam_date);
CREATE INDEX idx_alloc_srn ON seating_allocations(srn);
CREATE INDEX idx_alloc_examroom ON seating_allocations(exam_room_id);