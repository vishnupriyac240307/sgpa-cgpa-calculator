# 🎓 SGPA & CGPA Calculator (Full-Stack Edition)
### B.Sc. Computer Science with Data Analytics (6-Semester Degree)

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT_&_bcrypt-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

A modern full-stack user-authenticated academic management portal pre-configured for the 6-Semester **B.Sc. Computer Science with Data Analytics** degree curriculum. Allows students to register, securely log in, enter marks, dynamically calculate SGPA and CGPA, and persist their academic records across devices using MongoDB.

---

## 🌟 Key Features

* **🔐 User Authentication & Security**:
  * Complete Login and Registration flow.
  * Passwords hashed with `bcryptjs`.
  * JWT (JSON Web Tokens) with secure HTTP-only cookies and Bearer token fallback.
  * Password hashes are **never** exposed in API responses.
  * Protected API routes using Express authentication middleware.
  * Optional **Change Password** feature in user profile.

* **🔒 Strict User Data Isolation**:
  * Every student's marks and academic transcripts are securely isolated.
  * Requests strictly use the authenticated `userId` extracted from the JWT token.
  * Frontend cannot override or request another student's academic data.

* **⚡ Pre-Configured 6-Semester Curriculum**:
  * Pre-loaded course mapping, maximum marks (100, 75, 50), and credits (4, 3, 2).
  * Strict inclusion rules for Core, Core Lab, Allied, and Skill-Based subjects.
  * Automatic exclusion of general non-credit courses (Language, English, EVS, Value Education, etc.).

* **📐 High-Precision CGPA Engine**:
  * Calculates SGPA & CGPA using exact credit-weighted summation ($\sum \text{Weighted Points} / \sum \text{Credits}$).
  * Dynamic **"How your CGPA is calculated"** step-by-step breakdown.
  * Stores raw entered marks as the source of truth, dynamically recalculating SGPA & CGPA with full floating-point precision.

* **📊 Personal Student Dashboard**:
  * Current CGPA, Completed Credits, and Completed Semesters count (e.g. `4 / 6`).
  * 6 Semester overview cards displaying SGPA, Credits, and Completion Status.
  * Direct `[ Enter / Edit Marks ]` and `[ Save Marks ]` workflows with immediate dashboard updates.

* **📄 Official Academic Transcript View**:
  * Printable academic report view formatted for unconstrained multi-page printing.

---

## 🧮 Core Calculation Logic

### 1. Grade Point (10-Point Scale)
$$\text{Grade Point} = \left(\frac{\text{Marks Obtained}}{\text{Maximum Marks}}\right) \times 10$$

### 2. Weighted Point
$$\text{Weighted Point} = \text{Grade Point} \times \text{Course Credits}$$

### 3. Semester SGPA
$$\text{SGPA} = \frac{\sum_{\text{Included Subjects}} \text{Weighted Points}}{\sum_{\text{Included Subjects}} \text{Credits}}$$

### 4. Overall CGPA
$$\text{CGPA} = \frac{\sum_{\text{All Included Subjects Across Semesters}} \text{Weighted Points}}{\sum_{\text{All Included Subjects Across Semesters}} \text{Credits}}$$

---

## 🏗️ Architecture & Tech Stack

```
sgpa-cgpa-calculator/
├── server/               # Express + Node.js Backend
│   ├── config/           # MongoDB / MongoMemoryServer connection
│   ├── controllers/      # Auth & Academic Controllers
│   ├── middleware/       # JWT Authentication Middleware
│   ├── models/           # User & AcademicData Mongoose Schemas
│   └── routes/           # Protected API endpoints (/api/auth, /api/academic)
└── src/                  # React + TypeScript Frontend
    ├── components/       # Header, Dashboard, SubjectTable, SGPAResult, Transcript Modal
    ├── context/          # AuthContext provider
    ├── pages/            # Login, Register, Dashboard, Marks, Profile
    ├── services/         # API Service client (fetch /api)
    └── utils/            # Calculation engine & Vitest test suite
```

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v18+
* npm v9+

### Setup & Launch

```bash
# 1. Clone the repository
git clone https://github.com/vishnupriyac240307/sgpa-cgpa-calculator.git
cd sgpa-cgpa-calculator

# 2. Install dependencies
npm install

# 3. Start full-stack development environment (Backend + Frontend)
npm run dev
```

* Express Server starts on port **5000** (with automatic zero-config MongoMemoryServer fallback if local MongoDB is not running).
* Vite Frontend starts on [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing & Verification

```bash
# Run all unit tests & backend API integration tests (17 tests)
npm test
# OR
npx vitest run

# Build for production
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
