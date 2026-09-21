# 🎓 SGPA & CGPA Calculator
### B.Sc. Computer Science with Data Analytics (6-Semester Degree)

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-cyan?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, high-precision academic grade calculator specifically pre-configured for the 6-Semester **B.Sc. Computer Science with Data Analytics** curriculum. Built to calculate exact Semester Grade Point Average (SGPA) and overall Cumulative Grade Point Average (CGPA) using strict credit-weighted calculations.

---

## 🌟 Key Features

* **⚡ Pre-Configured 6-Semester Curriculum**: Complete subject mapping, maximum marks (100, 75, 50), and course credits (4, 3, 2) pre-loaded out of the box. Zero manual setup required for students.
* **📐 Pure Credit-Weighted Engine**: Calculates SGPA and CGPA using precise credit-weighted summation ($\sum \text{Weighted Points} / \sum \text{Credits}$) rather than naive averaging.
* **🛡️ Strict Subject Eligibility Rules**: Automatically includes Core, Core Lab, Allied, and Skill-Based subjects while excluding general non-credit courses (Language, English, Environmental Studies, Value Education, Naan Mudhalvan, etc.).
* **🎯 What-If CGPA Projection Tool**: Allows students to project target graduation CGPA by entering expected future SGPAs.
* **📊 Personal Academic Dashboard**: Highlighting Current vs. Final CGPA, total completed credits, and an interactive 6-semester SGPA overview.
* **📄 Printable Academic Transcript & JSON Export**: One-click official academic report view formatted for unconstrained multi-page printing or PDF saving.
* **💾 Automatic Progress Saving**: Automatically persists entered marks and student details to browser `localStorage`.
* **📱 Responsive Academic UI**: Optimized for desktop computers, tablets, and mobile devices with custom card views.

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

> ⚠️ **Note**: CGPA is **never** calculated by simply averaging SGPA values. It directly sums credit-weighted points across all completed semesters to ensure accurate representation of unequal credit distributions.

---

## 📚 Curriculum Structure Overview

| Semester | Included Course Categories | Total Credits |
| :--- | :--- | :---: |
| **Semester I** | Core 1, Core 2, Core Lab 1, Allied 1 | **16 Credits** |
| **Semester II** | Core 3, Core Lab 2, Core Lab 3, Allied 2 | **12 Credits** |
| **Semester III** | Core 4, Core 5, Core Lab 4, Allied 3, Skill Based 1 | **15 Credits** |
| **Semester IV** | Core 6, Core 7, Core Lab 5, Allied 4, Skill Based 2 Lab | **13 Credits** |
| **Semester V** | Core 8, Core 9, Core Lab 6, Skill Based 3 | **15 Credits** |
| **Semester VI** | Core 10, Core 11, Core Lab 7, Skill Based 4 | **13 Credits** |

*(Elective courses and general subjects can be custom-toggled in the interface if required).*

---

## 🛠️ Tech Stack

* **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 6](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.react.dev/)
* **Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ 
* npm v9+

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/vishnupriyac240307/sgpa-cgpa-calculator.git

# Navigate into the project directory
cd sgpa-cgpa-calculator

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Build

```bash
# Run automated unit test suite
npx vitest run

# Build for production
npm run build
```

---

## 🌐 Deploy to Vercel or Netlify

### Deploy to Vercel (1-Click)
1. Go to [vercel.com/new](https://vercel.com/new) and connect your GitHub account.
2. Select `sgpa-cgpa-calculator`.
3. Click **Deploy**.

### Deploy to Netlify
1. Go to [app.netlify.com/start](https://app.netlify.com/start) and select your GitHub repository.
2. Set Build Command: `npm run build` and Publish Directory: `dist`.
3. Click **Deploy Site**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
