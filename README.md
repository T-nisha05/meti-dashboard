# 📌 Internship Tracker Dashboard

A React + Firebase based Internship Tracker that helps you manage applications, resumes, and deadline/interview reminders with toast notifications.

---

## 🚀 Features

### ✅ Internship Management

* Add, edit, delete internship applications
* Track status: Applied, Shortlisted, Accepted, Rejected
* View applications in a searchable & filterable dashboard

### 📄 Resume Manager

* Upload resumes (PDF) using Supabase Storage
* Replace existing resumes
* View & download resumes inside a popup modal
* Central **Resume Manager modal** (no page navigation)

### ⏰ Deadline / Interview Reminders

* Toast notifications for upcoming deadlines or interviews
* Automatically triggers when:

  * Interview/Deadline is **today or tomorrow**
  * `reminderSent !== true`
* Clicking the toast navigates to Internship Details

### 📊 Analytics

* Status-wise bar chart
* Monthly applications chart (last 6 months)

---

## 🛠 Tech Stack

* **Frontend:** React, React Router
* **State & UI:** Bootstrap, Chart.js, Lucide Icons
* **Backend:** Firebase Firestore
* **Storage:** Supabase Storage (PDF resumes)
* **Notifications:** react-toastify
* **Date Handling:** dayjs

---

## 📁 Firestore Schema

### Collection: `internships`

```json
{
  "title": "Software Intern",
  "status": "Applied",
  "createdAt": "2025-01-10T10:30:00Z",
  "createdBy": "user@gmail.com",
  "resumeUrl": "https://...pdf",
  "interviewDate": Timestamp,
  "deadline": Timestamp,
  "reminderSent": false,
  "offerReceived": false
}
```

---

## 🔔 Toast Reminder Logic

### When does a toast appear?

* `internship.interviewDate` OR `deadline` exists
* `daysLeft <= 1` and `daysLeft >= 0`
* `reminderSent !== true`

### Example Toast

```
⏰ Interview reminder: "Summer Intern" is tomorrow
```

### After showing toast

```js
await updateDoc(doc(db, "internships", id), {
  reminderSent: true
});
```

➡ prevents duplicate reminders

---

## 🧪 How to Test Reminder Toasts

1. Open Firebase Console → Firestore
2. Set `interviewDate` or `deadline` to:

   * **Today** OR **Tomorrow**
3. Ensure:

   * `reminderSent` = false (or delete field)
4. Reload Dashboard

✅ Toast should appear once

---

## ⚠ Common Issues & Fixes

### ❌ Toast not showing?

✔ Ensure `ToastContainer` is added in `App.js`

```jsx
<ToastContainer position="top-right" />
```

✔ Ensure reminder logic runs **after internships load**

✔ Ensure Firestore date is a **Timestamp**, not string

---

## 💡 Notes

* Firebase **Cloud Functions are NOT required** for client-side reminders
* Blaze plan is NOT needed
* Resume uploads work fully on free tier via Supabase

---

## 📌 Future Enhancements

* Email reminders (Cloud Functions – optional)
* Notes & documents per internship
* Calendar integration

---

Happy building 🚀
