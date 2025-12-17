import { useEffect, useState } from "react";
import dayjs from "dayjs";
import CenterModal from "./CenterModal";

export default function OAReminderManager({ internships, enabled }) {
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);

  // don't run until interview reminders are done
  useEffect(() => {
    if (!enabled) return;
    if (!Array.isArray(internships) || internships.length === 0) return;

    const today = dayjs().startOf("day");
    const reminders = [];

    internships.forEach((i) => {
      const oaTs = i.timeline?.oaDateTime;
      if (!oaTs) return;

      const oaDate = oaTs.toDate ? dayjs(oaTs.toDate()) : dayjs(oaTs);

      const daysLeft = oaDate.startOf("day").diff(today, "day");

      if (daysLeft === 0 || daysLeft === 1) {
        reminders.push({
          id: `${i.id}-oa`,
          title: i.title,
          daysLeft,
        });
      }
    });

    if (reminders.length > 0) {
      setQueue(reminders);
      setIndex(0);
    }
  }, [enabled, internships]);

  const handleNext = () => {
    setIndex((prev) => {
      if (prev + 1 >= queue.length) {
        setQueue([]);
        return 0;
      }
      return prev + 1;
    });
  };

  if (!enabled || queue.length === 0) return null;

  const active = queue[index];

  return (
    <CenterModal
      show
      title="ONLINE ASSESSMENT REMINDER"
      accent="purple"
      message={`🧪 Online Assessment ${
        active.daysLeft === 0 ? "TODAY" : "TOMORROW"
      }: "${active.title}"`}
      queueText={`Reminder ${index + 1} / ${queue.length}`}
      onClose={handleNext}
      onDismissAll={() => setQueue([])}
    />
  );
}
