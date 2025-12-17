import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

const STATUSES = ["Applied", "Shortlisted", "Interview", "Accepted", "Rejected"];

// Helper: safely convert Firestore Timestamp, Date, or string to JS Date
const toJSDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  return new Date(value);
};

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch internship
  useEffect(() => {
    const fetchInternship = async () => {
      try {
        if (!id) throw new Error("No internship ID provided in URL");

        const ref = doc(db, "internships", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Internship not found");
          navigate("/dashboard");
          return;
        }

        const docData = snap.data();
        const timeline = docData.timeline || {};

        const interviewDateStr = timeline.interviewDate
          ? dayjs(toJSDate(timeline.interviewDate)).format("YYYY-MM-DD")
          : "";

        const oaDateTimeStr = timeline.oaDateTime
          ? dayjs(toJSDate(timeline.oaDateTime)).format("YYYY-MM-DDTHH:mm")
          : "";

        setData({
          ...docData,
          timeline: {
            ...timeline,
            interviewDateStr,
            oaDateTimeStr,
          },
        });
      } catch (err) {
        console.error("Error fetching internship:", err);
        alert("Failed to load internship: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id, navigate]);

  // OA remainder popup

  useEffect(() => {
  if (!data?.timeline?.oaDateTime) return;

  const oaDate = toJSDate(data.timeline.oaDateTime);
  if (!oaDate || isNaN(oaDate.getTime())) return;

  const now = new Date();
  const diffMinutes = (now - oaDate) / (1000 * 60);

  if (diffMinutes >= 0 && diffMinutes <= 15) {
    alert(
      `⏰ Online Assessment Reminder!\n\nYour OA was scheduled at ${dayjs(
        oaDate
      ).format("DD MMM YYYY, hh:mm A")}`
    );
  }
}, [data]);

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "internships", id);

      const dataToSave = {
        ...data,
        timeline: {
          ...data.timeline,
          interviewDate: data.timeline?.interviewDateStr
            ? Timestamp.fromDate(new Date(data.timeline.interviewDateStr))
            : null,
          oaDateTime: data.timeline?.oaDateTimeStr
            ? Timestamp.fromDate(new Date(data.timeline.oaDateTimeStr))
            : null,
        },
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(ref, dataToSave);
      alert("Changes saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="glass p-4">
        <h3 className="mb-2">{data.title}</h3>
        <p className="text-muted mb-4">{data.company}</p>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <span
              key={s}
              className={`badge px-3 py-2 ${
                data.status === s ? "bg-success" : "bg-secondary"
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Company</label>
            <input
              className="form-control"
              value={data.company || ""}
              onChange={(e) => setData({ ...data, company: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Location</label>
            <input
              className="form-control"
              value={data.location || ""}
              onChange={(e) => setData({ ...data, location: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Application Link</label>
            <input
              className="form-control"
              value={data.link || ""}
              onChange={(e) => setData({ ...data, link: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Interview Date</label>
            <input
              type="date"
              className="form-control"
              value={data.timeline?.interviewDateStr || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  timeline: {
                    ...data.timeline,
                    interviewDateStr: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Online Assessment (OA)</label>
            <input
              type="datetime-local"
              className="form-control"
              value={data.timeline?.oaDateTimeStr || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  timeline: {
                    ...data.timeline,
                    oaDateTimeStr: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="4"
              value={data.notes || ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <h6>Documents</h6>
          <button
            className="btn btn-outline-primary"
            disabled={!data.resumeUrl}
            onClick={() => window.open(data.resumeUrl, "_blank")}
          >
            View Resume
          </button>
        </div>

        <div className="text-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="text-muted small mt-3">
          Created on{" "}
          {data.createdAt
            ? dayjs(toJSDate(data.createdAt)).format("DD MMM YYYY")
            : "N/A"}
          {data.updatedAt
            ? ` | Updated on ${dayjs(toJSDate(data.updatedAt)).format(
                "DD MMM YYYY"
              )}`
            : ""}
        </div>
      </div>
    </div>
  );
}
