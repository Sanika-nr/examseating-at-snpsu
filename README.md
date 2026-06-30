# 🎓 Exam Seating Management System

A lightweight and efficient **web-based Exam Seating Management System** designed to automate university examination operations. The system replaces traditional manual seating arrangements with a centralized digital platform that allows administrators to manage exams, students, classrooms, and seating allocations efficiently.

The application provides separate interfaces for **Administrators, Students, and Invigilators**, ensuring smooth coordination during examination processes.

---

## 🌐 Live Demo

🔗 **Application Link:**  
NETLIFY : https://examseating-at-snpsu.netlify.app/

---

# 📌 Overview

Managing examination seating manually is time-consuming and often leads to errors such as incorrect seat allocation, difficulty in finding student locations, and attendance management issues.

The **Exam Seating Management System** solves these problems by providing:

- Automated seat allocation
- Digital exam hall management
- Quick student seat lookup
- Centralized examination data management

The system is designed to be simple, fast, and easy to use for universities and educational institutions.

---

# ✨ Features

## 👨‍💼 Admin Dashboard

The administrator has complete control over examination management.

### Features:
- Add and manage examination schedules
- Create and manage exam rooms/halls
- Upload and manage student details
- Automatically allocate seats to students
- Prevent duplicate seat allocation
- View complete seating arrangements
- Manage blocks and classroom capacity

---

## 👨‍🎓 Student Portal

A simple and user-friendly interface that allows students to quickly find their examination details.

### Features:
- Search using University Register Number (URN)
- View:
  - Exam hall number
  - Block name
  - Room number
  - Seat number
  - Examination details

### Benefits:
- Reduces confusion during examinations
- Saves student time
- Eliminates manual notice checking

---

## 📋 Invigilator Interface

A dedicated interface for examination supervisors.

### Features:
- Visual **5 × 6 seating grid representation**
- Real-time attendance marking
- Student status management:
  - ✅ Present
  - ❌ Absent
  - ⚠️ Malpractice
- Easy classroom monitoring
- Quick seat-based student identification

---

# 🖥️ System Architecture

```
                ┌─────────────────┐
                │     Student     │
                │     Portal      │
                └────────┬────────┘
                         │
                         │
┌────────────┐     ┌──────▼──────┐     ┌──────────────┐
│   Admin    │────▶│  Backend    │────▶│  SQLite DB   │
│ Dashboard  │     │ Node/Express│     │              │
└────────────┘     └──────┬──────┘     └──────────────┘
                         │
                         │
                ┌────────▼────────┐
                │  Invigilator    │
                │   Interface     │
                └─────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React.js | User interface development |
| Tailwind CSS | Responsive styling |
| JavaScript | Frontend logic |

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Server-side runtime |
| Express.js | Backend API framework |

## Database

| Technology | Purpose |
|------------|---------|
| SQLite | Lightweight relational database |
| SQL | Data management |

## Hosting

| Platform | Usage |
|----------|-------|
| Netlify | Frontend hosting |
| Cloud server | Backend deployment |

---

# 🤝 Contribution

Contributions are welcome!

Steps:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Create a Pull Request

---

# 👨‍💻 Authors

Developed by:

**Sanika NR**

---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!
