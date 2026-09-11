# ⚡ SkillSwap Campus

> **Campus Platform connecting Student Learning with Verified Real-World Micro-Gigs.**  
> *“I know Python → I prove my skill → I get matched with real campus work → I gain practical experience & trust.”*

---

## 🎯 The Core USP: Skill → Rank → Real Task

Unlike traditional freelancing platforms or generic course sites, **SkillSwap Campus** solves the fundamental problem students face:
> *"I learned a skill, but where do I actually practice it and prove I can deliver?"*

### The Campus Loop:
```
                SKILLSWAP CAMPUS
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
   LEARN SKILLS                 FIND TASKS
        │                             │
        ↓                             ↓
   Learn from                    Campus Micro-Gigs
   other students                     │
        │                             ↓
        ↓                       Skill Matching
   Practice Quiz                      │
        │                             ↓
        ↓                       Recommended
   Skill Score                         Task
        │                             │
        └──────────────┬──────────────┘
                       ↓
                COMPLETE TASK
                       ↓
                  GET RATING
                       ↓
              EXPERIENCE + RANK ↑
```

---

## 🚀 Key Features

### 1. ✍️ Skill Verification & Trust Score Engine
- Objective mini-quizzes for in-demand campus skills (Python, Excel, HTML/CSS, Graphic Design).
- Real-time scoring out of 100 with verified rank badges:
  - **Novice** (0 – 49)
  - **Intermediate** (50 – 74)
  - **Advanced** (75 – 89)
  - **Master** (90 – 100)
- Trust Score dynamically calculated from quiz scores, completed tasks, and peer ratings.

### 2. 🏫 Campus Micro-Gigs Marketplace
- Real campus work posted by department exam cells, student clubs, and professors:
  - *"Clean & Format 1,200 Student Exam Attendance Records in Excel"* (₹300)
  - *"Build Python Automation Script for College Fest Registrations"* (₹600)
  - *"Design Official Posters for HackCampus 2026"* (₹500)
  - *"Fix Mobile Responsive Menu on Robotics Club Site"* (₹350)
- **Smart Matchmaker**: Gigs matching the student's verified skills & rank are automatically tagged **"⚡ Match for You"**.
- Unverified students are prompted to take the assessment to qualify.

### 3. 🔄 End-to-End Task Lifecycle
- **Post a Task**: Providers specify skill requirement, minimum verified rank, deadline, and reward (₹ Cash + Certificates + XP).
- **Apply with Pitch**: Student's verified score and rank are pre-attached to the application.
- **Manage Applicants**: Provider reviews verified scores and accepts the best fit.
- **Complete & Dual Rating**: Provider gives star rating + written review upon delivery, which automatically updates the student's XP, completed task counter, and Trust Score.

### 4. 🤝 Peer Skill Exchange (Learn & Teach)
- Student directory: *"Offers [Python, Git] | Wants to Learn [Figma, Video Editing]"*.
- Propose 1-on-1 swap sessions directly with campus peers.

### 5. 🏆 Campus Talent Leaderboard & Portfolio
- Ranks students by XP, gigs completed, and peer ratings.
- Transparent student profile showcasing verified skill meters and recommendations.

### 6. 🔐 Complete Authentication & Registration System (NEW)
- **Sign Up as Student**: Register with Full Name, Campus Email, Password, Department, Academic Year, and initial skills. Automatically creates a profile, awards 50 Welcome XP, and adds to the Peer Swap Directory.
- **Sign Up as Client / Task Provider**: Register campus student clubs, faculty departments, or administrative cells with Organization Name, Contact Person, Email, Password, and Category.
- **Log In & Session Management**: Log in with campus email & password, switch accounts, or log out. User avatar dropdown displays active account credentials.
- **1-Click Quick Demo Accounts**: Instant 1-click test buttons for Rahul (Student), Ananya (Student), Prof. S. Sen (Exam Cell Client), and Robotics Club (Tech Club Client) for fast live presentations.
- **Role Switcher & Reset**: Switch roles on the fly and reset demo data in 1 click.

---

## 💻 Tech Stack & Architecture

- **Frontend**: Semantic HTML5, Modular CSS3 with Custom Properties (Inter font, responsive cards, glassmorphism), Vanilla ES6+ JavaScript.
- **State Management**: Zero dependencies! Uses browser `localStorage` with reactive syncing so the app runs immediately without any build steps.
- **Backend Ready**: Cleanly separated data models (`users`, `tasks`, `quizzes`, `peerSwaps`) ready to plug into Flask & SQLite.

---

## 🏃 How to Run Locally

### Option 1: Direct in Browser
Simply double-click or open `index.html` in any web browser:
```bash
open index.html
```

### Option 2: Local Python Server (Recommended)
From the project folder:
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🎤 Hackathon 2-Minute Demo Flow

1. **Start on Student View (Rahul Sharma)**:
   - Highlight the USP banner: *"Skill → Rank → Real Task"*.
   - Point out Rahul's Trust Score (88/100) and verified Python skill.
2. **Take an Assessment**:
   - Go to **Skill Quizzes** tab.
   - Click **Take Verification Assessment** for *Excel* or *HTML/CSS*.
   - Answer the 4 questions → Click Submit.
   - Show the celebration score modal, rank upgrade, and XP reward!
3. **Check Campus Micro-Gigs**:
   - Go to **Campus Gigs** tab.
   - Notice the **"⚡ Match for You"** badge on tasks matching your new rank.
   - Click **Apply Now** on a task and submit your pitch.
4. **Switch to Task Provider Mode**:
   - Click **Task Provider** in the top header pill.
   - Click **+ Post Campus Task** to show how easy it is for clubs/faculty to post gigs.
   - On an existing task, click **Manage Applicants** → Review Rahul's verified score → Click **Accept Student**.
   - Click **Mark Completed & Rate** → Give 5 stars and review → Submit.
5. **Show Proof of Impact**:
   - Switch back to **Student** mode.
   - Open **My Profile** or **Leaderboard** to show Rahul's XP, rating, and task counter updated instantly!

---

## 🔌 Connecting to Flask + SQLite (Next Step)

The state format in `js/seed-data.js` maps 1:1 with SQLite tables:
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 80
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    required_skill TEXT NOT NULL,
    min_rank TEXT NOT NULL,
    reward_amount INTEGER,
    status TEXT DEFAULT 'open',
    posted_by TEXT REFERENCES users(id),
    assigned_to TEXT REFERENCES users(id)
);

CREATE TABLE user_skills (
    user_id TEXT REFERENCES users(id),
    skill_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    rank TEXT NOT NULL,
    verified BOOLEAN DEFAULT 1,
    PRIMARY KEY (user_id, skill_name)
);
```
