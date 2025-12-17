// src/components/Dashboard.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";
import CenterModal from "./CenterModal";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import supabase from "../supabaseClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Archive, UserPlus, BarChart2, LogOut } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STATUSES = ["Applied", "Shortlisted", "Accepted", "Rejected"];

/* ---------- helpers ---------- */
const statusBadge = (status) => {
  switch (status) {
    case "Applied":
      return "bg-info text-dark";
    case "Shortlisted":
      return "bg-warning text-dark";
    case "Accepted":
      return "bg-success";
    case "Rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

function StatCard({ iconBg, icon, title, value }) {
  return (
    <div className="col">
      <div className="p-3 glass d-flex align-items-center gap-3 h-100">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 44,
            height: 44,
            background: iconBg,
            color: "#fff",
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="h5 mb-0">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- component ---------- */
export default function Dashboard({ user }) {
  const [internships, setInternships] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortNewest, setSortNewest] = useState(true);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [showResumeManager, setShowResumeManager] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [reminderQueue, setReminderQueue] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);

  const [resumePreview, setResumePreview] = useState(null);
  const navigate = useNavigate();

  const collRef = collection(db, "internships");

  const reminderShownRef = useRef(false);

  /* ---------- realtime fetch ---------- */
  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);

    const q = query(collRef, where("createdBy", "==", user.email));
    const unsub = onSnapshot(q, (snapshot) => {
      setInternships(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user?.email]);

  // useEffect(() => {
  //   if (!internships.length) return;

  //   const today = dayjs().startOf("day");

  //   internships.forEach(async (i) => {
  //     if (!i.interviewDate || i.reminderSent) return;

  //     const interviewDate = i.interviewDate.toDate
  //       ? dayjs(i.interviewDate.toDate()).startOf("day")
  //       : dayjs(new Date(i.interviewDate)).startOf("day");

  //     const daysLeft = interviewDate.diff(today, "day");

  //     if (daysLeft <= 1 && daysLeft >= 0) {
  //       toast.warn(
  //         `⏰ Interview reminder: "${i.title}" ${
  //           daysLeft === 0 ? "is today!" : "is tomorrow"
  //         }`,
  //         {
  //           onClick: () => navigate(`/internship/${i.id}`),
  //         }
  //       );

  //       await updateDoc(doc(db, "internships", i.id), {
  //         reminderSent: true,
  //       });
  //     }
  //   });
  // }, [internships]);

  const toJSDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    return new Date(value);
  };

  useEffect(() => {
    if (!internships.length) return;

    const today = dayjs().startOf("day");
    const queue = [];

    internships.forEach((i) => {
      const interviewTs = i.timeline?.interviewDate;

      if (!interviewTs || i.reminderSent) return;

      const interviewDate = interviewTs.toDate
        ? dayjs(interviewTs.toDate()).startOf("day")
        : dayjs(interviewTs).startOf("day");

      const daysLeft = interviewDate.diff(today, "day");

      if (daysLeft <= 1 && daysLeft >= 0) {
        queue.push({
          id: i.id,
          title: i.title,
          daysLeft,
        });
      }
    });

    if (queue.length > 0) {
      setReminderQueue(queue);
      setActiveReminder(queue[0]);
    }
  }, [internships]);

  const handleReminderClose = async () => {
    if (!activeReminder) return;

    // mark reminder sent in Firestore
    await updateDoc(doc(db, "internships", activeReminder.id), {
      reminderSent: true,
    });

    const remaining = reminderQueue.slice(1);

    setReminderQueue(remaining);
    setActiveReminder(remaining[0] || null);
  };

  /* ---------- CRUD ---------- */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addDoc(collRef, {
      title: title.trim(),
      status: "Applied",
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      resumeUrl: null,
      offerReceived: false,
      reminderSent: false,
    });

    setTitle("");
  };

const handleDelete = async (id) => {
  if (!window.confirm("Delete this internship?")) return;

  try {
    await deleteDoc(doc(db, "internships", id));
    toast.success("Internship deleted successfully");
  } catch (err) {
    toast.error("Failed to delete internship");
  }
};

  const openEdit = (item) =>
    setEditing({ id: item.id, title: item.title, status: item.status });

 const handleSaveEdit = async () => {
  if (!editing.title.trim()) return;

  try {
    await updateDoc(doc(db, "internships", editing.id), {
      title: editing.title.trim(),
      status: editing.status,
      offerReceived: editing.status === "Accepted",
    });

    toast.success("Internship updated successfully");
    setEditing(null);
  } catch (err) {
    toast.error("Failed to update internship");
  }
};


  /* ---------- Resume Upload / Replace ---------- */
  const handleResumeUpload = async (internship) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploadingId(internship.id);

        const filePath = `${user.email}/${internship.id}.pdf`;

        const { error } = await supabase.storage
          .from("resumes")
          .upload(filePath, file, { upsert: true });

        if (error) throw error;

        const { data } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        await updateDoc(doc(db, "internships", internship.id), {
          resumeUrl: data.publicUrl,
        });

        toast.success("Resume uploaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Resume upload failed");
      } finally {
        setUploadingId(null);
      }
    };

    input.click();
  };

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    const base = { Applied: 0, Shortlisted: 0, Accepted: 0, Rejected: 0 };
    internships.forEach((i) => base[i.status]++);
    return { total: internships.length, ...base };
  }, [internships]);

  /* ---------- charts ---------- */
  const chartData = useMemo(() => {
    const statusBar = {
      labels: STATUSES,
      datasets: [
        {
          data: STATUSES.map((s) => stats[s]),
          backgroundColor: ["#0dcaf0", "#f59e0b", "#16a34a", "#dc3545"],
        },
      ],
    };

    const months = [];
    const count = {};
    for (let i = 5; i >= 0; i--) {
      const m = dayjs().subtract(i, "month").format("MMM YYYY");
      months.push(m);
      count[m] = 0;
    }

    internships.forEach((i) => {
      const m = dayjs(i.createdAt).format("MMM YYYY");
      if (count[m] !== undefined) count[m]++;
    });

    const monthBar = {
      labels: months,
      datasets: [
        { data: months.map((m) => count[m]), backgroundColor: "#0d6efd" },
      ],
    };

    return { statusBar, monthBar };
  }, [internships, stats]);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = [...internships];

    if (search.trim()) {
      list = list.filter((i) =>
        i.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((i) => i.status === statusFilter);
    }

    list.sort((a, b) =>
      sortNewest
        ? dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
        : dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
    );

    return list;
  }, [internships, search, statusFilter, sortNewest]);

  /* ---------- UI ---------- */
  return (
    <div className="d-flex mt-3">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-grow-1 p-4">
        {/* <TopNavbar user={user} /> */}

        {/* ===== Primary Action Bar ===== */}
        <div className="glass p-3 mb-4 d-flex align-items-center justify-content-between">
          <div>
            <h5 className="mb-0">Internship Application</h5>
            <small className="text-muted">
              All your applications and documents, organized smartly
            </small>
          </div>

          <button
            className="resume-btn"
            disabled={!internships.some((i) => i.resumeUrl)}
            onClick={() => setShowResumeManager(true)}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.2rem" }}>📄</span>
              <div className="text-start">
                <div className="fw-semibold">Resume Manager</div>
                <div className="small text-muted">
                  View / Download / Replace resumes
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Controls */}
        <form id="add-form" className="row g-2 mb-4" onSubmit={handleAdd}>
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="New internship title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100">+ Add</button>
          </div>
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Stat cards */}
        <div className="row g-3 mb-4">
          <StatCard
            iconBg="#0d6efd"
            icon={<Archive />}
            title="Total"
            value={stats.total}
          />
          <StatCard
            iconBg="#0dcaf0"
            icon={<UserPlus />}
            title="Applied"
            value={stats.Applied}
          />
          <StatCard
            iconBg="#f59e0b"
            icon={<BarChart2 />}
            title="Shortlisted"
            value={stats.Shortlisted}
          />
          <StatCard
            iconBg="#16a34a"
            icon={<BarChart2 />}
            title="Accepted"
            value={stats.Accepted}
          />
        </div>

        {/* Table */}
        <div className="glass p-3 mb-4">
          <h6>All Applications</h6>
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th className="text-center">Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No internships found
                  </td>
                </tr>
              )}
              {filtered.map((i) => (
                <tr key={i.id}>
                  {/* Title */}
                  <td>
                    <span
                      className="fw-semibold text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/internship/${i.id}`)}
                    >
                      {i.title}
                    </span>

                    {i.status === "Accepted" && (
                      <span className="badge bg-success ms-2">
                        🎉 Offer Received
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${statusBadge(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-wrap gap-2">
                      {/* Upload Resume */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={i.resumeUrl || uploadingId === i.id}
                        onClick={() => handleResumeUpload(i)}
                      >
                        {uploadingId === i.id
                          ? "Uploading..."
                          : i.resumeUrl
                          ? "Resume Uploaded"
                          : "Upload Resume"}
                      </button>

                      {/* Edit */}
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => openEdit(i)}
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(i.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div className="row g-3">
          <div className="col-lg-6 glass p-3">
            <h6>Applications by status</h6>
            <Bar
              data={chartData.statusBar}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="col-lg-6 glass p-3">
            <h6>Last 6 months</h6>
            <Bar
              data={chartData.monthBar}
              options={{ plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      </main>

      {/* Resume Preview Modal */}
      {resumePreview && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,.5)", zIndex: 1040 }}
            onClick={() => setResumePreview(null)}
          />
          <div
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-3 p-3"
            style={{ zIndex: 1050, width: "90%", maxWidth: 800 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Resume Preview</h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setResumePreview(null)}
              >
                Close
              </button>
            </div>
            <iframe
              src={resumePreview.resumeUrl}
              title="Resume Preview"
              style={{ width: "100%", height: "500px", border: "none" }}
            />
            <div className="text-end mt-3">
              <a
                href={resumePreview.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary"
              >
                Download
              </a>
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      {editing && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,.4)", zIndex: 1040 }}
            onClick={() => setEditing(null)}
          />
          <div
            className="position-fixed top-50 start-50 translate-middle"
            style={{ zIndex: 1050, width: 400 }}
          >
            <div className="glass p-4">
              <h5>Edit Internship</h5>
              <input
                className="form-control mb-2"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
              <select
                className="form-select mb-3"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* ===== Resume Manager Modal ===== */}
      {showResumeManager && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
            onClick={() => setShowResumeManager(false)}
          />

          {/* Modal */}
          <div
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 p-4"
            style={{ zIndex: 1050, width: "90%", maxWidth: 900 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">📄 Resume Manager</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowResumeManager(false)}
              >
                Close
              </button>
            </div>

            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Internship</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {internships.filter((i) => i.resumeUrl).length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">
                      No resumes uploaded yet
                    </td>
                  </tr>
                )}

                {internships
                  .filter((i) => i.resumeUrl)
                  .map((i) => (
                    <tr key={i.id}>
                      <td className="fw-semibold">{i.title}</td>

                      {/* <td>
                  <span className={`badge ${statusBadge(i.status)}`}>
                    {i.status}
                  </span>
                </td> */}

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {/* View */}
                          <button
                            className="btn btn-sm btn-outline-pink"
                            onClick={() => {
                              setShowResumeManager(false);  
                              setResumePreview({ resumeUrl: i.resumeUrl });
                            }}
                          >
                            View
                          </button>

                          {/* Download */}
                          <a
                            href={i.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Download
                          </a>

                          {/* Replace */}
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleResumeUpload(i)}
                          >
                            Replace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Centered Modal */}
      <CenterModal
        show={!!activeReminder}
        message={
          activeReminder
            ? `⏰ Interview reminder: "${activeReminder.title}" ${
                activeReminder.daysLeft === 0 ? "is TODAY!" : "is TOMORROW!"
              }`
            : ""
        }
        onClose={handleReminderClose}
      />
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
