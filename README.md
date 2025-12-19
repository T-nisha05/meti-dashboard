# Internix — Internship Application Tracker

**Internix** A modern Internship Management & Tracking Dashboard built with React, Firebase, Supabase, and Chart.js. Designed to help students track applications, upload resumes, view analytics, and receive deadline reminders — all in one place.

The project is inspired by the **structured, detail‑oriented application workflows used by programs like METI / OIST**, where clarity, tracking, and documentation play a critical role in the selection process.

This repository demonstrates **clean frontend architecture, real‑time data handling, and practical problem‑solving** expected in research‑oriented and international internship programs.

---

## 📌 Problem Statement

Students applying to multiple internships often face:

* Scattered resumes and documents
* Missed deadlines or interview dates
* No clear overview of application progress
* Manual tracking using spreadsheets

**Internix solves this by providing a single, structured dashboard** to track applications, resumes, and deadlines reliably.

---

## ✨ Key Features

### 1. Internship Application Dashboard

* Add, edit, and delete internship applications
* Track application status:

  * `Applied`
  * `Shortlisted`
  * `Accepted`
  * `Rejected`
* Real‑time updates using **Firestore listeners**
* Status and time‑based analytics using charts

### 2. Resume Management System (Popup‑based)

* Upload **multiple PDF resumes**
* Each resume is linked to a specific internship
* Central **Resume Manager modal** (no page navigation)
* View, download, and replace resumes
* Files stored securely using **Supabase Storage**

### 3. Deadline & Reminder System

* Store application deadlines / interview dates
* Automatic **toast reminders** when deadlines are near
* Prevents duplicate alerts using a `reminderSent` flag
* Implemented fully on the client side

> Designed intentionally **without Cloud Functions** to remain compatible with the Firebase free plan

### 4. Internship Details (Scalable Design)

* Navigation‑ready Internship Details page
* Firestore schema supports:

  * Notes
  * Interview rounds
  * Documents
  * Timeline extensions

### 5. Authentication & Data Isolation

* Firebase Email Authentication
* Each user accesses **only their own applications**

---

## 🧱 System Architecture

```
React (UI)
  ↓
Firebase Authentication
  ↓
Firestore (Real‑time database)
  ↓
Supabase Storage (PDF resumes)
```

---

## 🗂 Firestore Data Schema

### Collection: `internships`

```js
{
  title: string,
  status: "Applied" | "Shortlisted" | "Accepted" | "Rejected",
  createdAt: string,
  createdBy: string,      // user email
  resumeUrl: string|null, // Supabase public URL
  deadline: Timestamp|null,
  reminderSent: boolean,
  offerReceived: boolean
}
```

This schema is intentionally designed to be **extensible**, supporting future features such as interview timelines and notes.

---

## 🔔 Deadline Reminder Logic (Important)

* Implemented in `Dashboard.js` using `useEffect`
* Trigger conditions:

  * Deadline exists
  * Deadline is within **next 3 days**
  * `reminderSent === false`

When conditions are met:

1. A toast notification is shown
2. Firestore is updated → `reminderSent: true`

This ensures:

* No repeated alerts
* Deterministic behavior on refresh

---

## 🧪 How to Test Deadline Reminders

1. In Firestore, set `deadline` as a **Timestamp**
2. Ensure `reminderSent = false`
3. Refresh the dashboard
4. Toast notification appears once

⚠️ Deadlines stored as strings will **not** trigger reminders

---

## 🛠 Tech Stack

| Layer         | Technology              |
| ------------- | ----------------------- |
| Frontend      | React, Bootstrap        |
| Charts        | Chart.js                |
| Backend       | Firebase Firestore      |
| Auth          | Firebase Authentication |
| File Storage  | Supabase Storage        |
| Notifications | react-toastify          |
| Date Handling | dayjs                   |

---

## ⚙️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/internix.git

# Install dependencies
npm install

# Run locally
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

---

## 🎯 Design Philosophy

* Emphasis on **clarity and structure**
* Deterministic application tracking
* Transparent data schema
* Minimal UI distractions
* Extensible for research‑style workflows

This project reflects the type of **organized, detail‑oriented engineering mindset** expected in international research and internship programs.

---

## 🚀 Future Enhancements

* Email reminders (Cloud Functions – optional)
* Interview timeline visualization
* Notes & feedback per application
* Resume version history
* Exportable application reports

---

## 👨‍💻 Author


**Tanisha Pandya**
Engineering Student | Aspiring Software Engineer

---

⭐ If this project helped you understand structured internship tracking, consider starring the repository.
