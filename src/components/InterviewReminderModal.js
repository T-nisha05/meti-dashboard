import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import CenterModal from "./CenterModal";

export default function InterviewReminderModal({ internships, onDone }) {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const SHOWN_KEY = "interviewRemindersShown";

  // prevents running twice on same refresh
  const initialized = useRef(false);

 useEffect(() => {
  if (!Array.isArray(internships) || internships.length === 0) return;

  // 🔒 STOP if already shown in this session
  if (sessionStorage.getItem(SHOWN_KEY)) return;

  const today = dayjs().startOf("day");
  const reminders = [];

  internships.forEach((i) => {
    const interviewTs = i.timeline?.interviewDate;
    if (!interviewTs) return;

    const interviewDate = interviewTs.toDate
      ? dayjs(interviewTs.toDate())
      : dayjs(interviewTs);

    const daysLeft = interviewDate.startOf("day").diff(today, "day");

    if (daysLeft === 0 || daysLeft === 1) {
      reminders.push({
        id: `${i.id}-interview`,
        title: i.title,
        daysLeft,
      });
    }
  });

  if (reminders.length > 0) {
    setQueue(reminders);
    setIndex(0);

    // 🔐 LOCK IT
    sessionStorage.setItem(SHOWN_KEY, "true");
  }
}, [internships]);


  const handleNext = () => {
    setIndex((prev) => {
      if (prev + 1 >= queue.length) {
        setQueue([]);
        onDone?.();
        return 0;
      }
      return prev + 1;
    });
  };

  if (queue.length === 0) return null;

  const active = queue[index];

  return (
    <CenterModal
      show
      title="INTERVIEW REMINDER"
      accent={active.daysLeft === 0 ? "yellow" : "blue"}
      message={`⏰ Interview ${
        active.daysLeft === 0 ? "TODAY" : "TOMORROW"
      }: "${active.title}"`}
      queueText={`Reminder ${index + 1} / ${queue.length}`}
      onClose={handleNext}
      onDismissAll={() => {
        setQueue([]);
        onDone?.();
      }}
    />
  );
}
