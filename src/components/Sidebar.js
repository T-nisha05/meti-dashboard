import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Sidebar({ user }) {
  return (
    <aside className="sidebar">

      {/* Brand Section */}
      <div className="sidebar-brand text-center">
        <img src="/job-seeker.png" alt="Internix Logo" className="brand-logo" />
        <h2 className="brand-name">Track. Apply. Succeed.</h2>
        <p className="brand-tagline">
           with Internix
        </p>
      </div>

      <hr className="sidebar-divider" />

      {/* Profile Button */}
      <button
        className="profile-button"
        onClick={() => signOut(auth)}
      >
        <div className="avatar">👤</div>
        <div className="profile-info">
          <strong>{user?.email?.split("@")[0]}</strong>
          <small>{user?.email}</small>
          <span className="logout-text">Logout</span>
        </div>
      </button>

    </aside>
  );
}
