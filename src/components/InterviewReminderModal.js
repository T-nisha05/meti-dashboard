import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import CenterModal from "./CenterModal";

export default function InterviewReminderModal({ internships, onDone }) {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);

  // 🔒 prevents running twice on same refresh
  const initialized = useRef(false);

  useEffect(() => {
    if (!Array.isArray(internships) || internships.length === 0) return;

    const today = dayjs().startOf("day");

    const reminders = [];

    internships.forEach((i) => {
      const today = dayjs().startOf("day");

      // ===== INTERVIEW REMINDER =====
      const interviewTs = i.timeline?.interviewDate;
      if (interviewTs) {
        const interviewDate = interviewTs.toDate
          ? dayjs(interviewTs.toDate())
          : dayjs(interviewTs);

        const daysLeft = interviewDate.startOf("day").diff(today, "day");

        if (daysLeft === 0 || daysLeft === 1) {
          reminders.push({
            id: `${i.id}-interview`,
            type: "INTERVIEW",
            title: i.title,
            daysLeft,
          });
        }
      }
    });

    setQueue(reminders);

    console.log("FINAL REMINDER QUEUE:", reminders);

    if (reminders.length > 0) {
      setQueue(reminders);
      setIndex(0);
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
