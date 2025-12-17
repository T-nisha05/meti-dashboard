import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { auth, db } from "./firebase";
import dayjs from "dayjs";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import InternshipDetails from "./components/InternshipDetails";
import OAReminderManager from "./components/OAReminderManager";
import InterviewReminderModal from "./components/InterviewReminderModal";
import TopNavbar from "./components/TopNavbar";

/* ---------------- Layout Wrapper ---------------- */
function AppLayout({
  reminders,
  internships,
  interviewDone,
  setInterviewDone,
  shouldShowReminders,
  children,
}) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <>
      {isDashboard && <TopNavbar reminders={reminders} />}

      {isDashboard && shouldShowReminders && internships.length > 0 && (
        <>
          <InterviewReminderModal
            internships={internships}
            onDone={() => setTimeout(() => setInterviewDone(true), 1000)}
          />
          <OAReminderManager
            internships={internships}
            enabled={interviewDone}
          />
        </>
      )}

      {children}
    </>
  );
}

function App() {
  const [shouldShowReminders, setShouldShowReminders] = useState(false);
  const [user, setUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [interviewDone, setInterviewDone] = useState(false);

  const [interviewReminders, setInterviewReminders] = useState([]);
  const [oaReminders, setOAReminders] = useState([]);

  // 🔐 THIS IS THE FIX (persists across re-renders)
  const reminderShownRef = useRef(false);

  const calculateDaysLeft = (date) => {
    if (!date) return null;
    const target = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    return target.diff(today, "day");
  };

  /* ---------- Auth ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  /* ---------- Fetch internships ---------- */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "internships"),
      where("createdBy", "==", user.email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const internshipsData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setInternships(internshipsData);

      const interviewRems = internshipsData.map((i) => {
        const interviewDate = i.timeline?.interviewDate;

        return {
          id: `interview-${i.id}`,
          type: "Interview",
          title: i.company || i.title,
          date: interviewDate
            ? dayjs(
                interviewDate.toDate ? interviewDate.toDate() : interviewDate
              ).format("DD MMM YYYY")
            : null,
          time: null,
          daysLeft: interviewDate
            ? calculateDaysLeft(
                interviewDate.toDate ? interviewDate.toDate() : interviewDate
              )
            : null,
        };
      });

      const oaRems = internshipsData.map((i) => {
        const oaDT = i.timeline?.oaDateTime;

        return {
          id: `oa-${i.id}`,
          type: "OA",
          title: i.company || i.title,
          date: oaDT
            ? dayjs(oaDT.toDate ? oaDT.toDate() : oaDT).format("DD MMM YYYY")
            : null,
          time: oaDT
            ? dayjs(oaDT.toDate ? oaDT.toDate() : oaDT).format("hh:mm A")
            : null,
          daysLeft: oaDT
            ? calculateDaysLeft(oaDT.toDate ? oaDT.toDate() : oaDT)
            : null,
        };
      });

      setInterviewReminders(interviewRems);
      setOAReminders(oaRems);

      if (!reminderShownRef.current) {
        reminderShownRef.current = true;
        setShouldShowReminders(true);
      }
    });

    return () => unsub();
  }, [user]);

  // ⏱ auto-hide after first show
  // useEffect(() => {
  //   if (shouldShowReminders) {
  //     const timer = setTimeout(() => {
  //       setShouldShowReminders(false);
  //     }, 4000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [shouldShowReminders]);

  if (initializing) return <div>Loading...</div>;

  return (
    <Router>
      <AppLayout
        reminders={[...interviewReminders, ...oaReminders]}
        internships={internships}
        interviewDone={interviewDone}
        setInterviewDone={setInterviewDone}
        shouldShowReminders={shouldShowReminders}
      >
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />

          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
          />

          <Route
            path="/internship/:id"
            element={
              user ? <InternshipDetails user={user} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
