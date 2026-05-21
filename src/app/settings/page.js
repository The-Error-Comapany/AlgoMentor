"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { User, KeyRound, Bell, Share2, Sparkles, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";

function SettingsContent() {
  const [profile, setProfile] = useState({
    name: "Aishvary",
    email: "aishvary.cpp@gmail.com",
    avatar: "A"
  });

  // Handle synchronization states
  const [handles, setHandles] = useState({
    leetcode: "aishvary_code",
    codeforces: "",
    gfg: ""
  });

  const [syncStatus, setSyncStatus] = useState({
    leetcode: "verified", // verified | unlinked | verifying
    codeforces: "unlinked",
    gfg: "unlinked"
  });

  // Notification states
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    browserAlerts: true,
    reminderTime: "60" // 10, 30, 60, 120 minutes
  });

  const [loadingPlatform, setLoadingPlatform] = useState(null);

  const handleVerifySync = (platform) => {
    if (!handles[platform].trim()) return;

    setLoadingPlatform(platform);
    setSyncStatus(prev => ({ ...prev, [platform]: "verifying" }));

    // Simulate handle linking search on platform APIs
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [platform]: "verified" }));
      setLoadingPlatform(null);
    }, 2000);
  };

  const handleUnlink = (platform) => {
    setSyncStatus(prev => ({ ...prev, [platform]: "unlinked" }));
    setHandles(prev => ({ ...prev, [platform]: "" }));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="settings-grid-layout">
      
      {/* Left Column: Account Details + Platform Sync */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Profile Info */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={16} style={{ color: "var(--primary-light)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Profile Information</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyCenter: "center", color: "white", fontWeight: "700", fontSize: "1.5rem", border: "2px solid var(--border-ice-hover)", display: "flex", justifyContent: "center" }}>
              {profile.avatar}
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block" }}>Profile Avatar</span>
              <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", marginTop: "4px" }}>Change Avatar</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Platform handle linking */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={16} style={{ color: "var(--text-info)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Platform Handle Syncing</h3>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>
            Link your usernames to retrieve ratings, contest histories, and sync extension history.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* LeetCode Sync */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", color: "#ffa116", fontWeight: "600" }}>LeetCode Handle</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Leetcode Username"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  disabled={syncStatus.leetcode === "verified" || syncStatus.leetcode === "verifying"}
                  style={{ borderColor: syncStatus.leetcode === "verified" ? "rgba(16, 185, 129, 0.2)" : "" }}
                />
                
                {syncStatus.leetcode === "verified" ? (
                  <button className="btn btn-danger btn-sm" style={{ padding: "0 1rem" }} onClick={() => handleUnlink("leetcode")}>Unlink</button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: "0 1rem", fontSize: "0.75rem" }}
                    onClick={() => handleVerifySync("leetcode")}
                    disabled={syncStatus.leetcode === "verifying" || !handles.leetcode.trim()}
                  >
                    {syncStatus.leetcode === "verifying" ? <RefreshCw size={12} className="pulse-green" /> : null}
                    <span>{syncStatus.leetcode === "verifying" ? "Syncing..." : "Verify & Sync"}</span>
                  </button>
                )}
              </div>
              {syncStatus.leetcode === "verified" && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={10} /> Account connected successfully!
                </span>
              )}
            </div>

            {/* Codeforces Sync */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", color: "#318dec", fontWeight: "600" }}>Codeforces Handle</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Codeforces Handle"
                  value={handles.codeforces}
                  onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                  disabled={syncStatus.codeforces === "verified" || syncStatus.codeforces === "verifying"}
                  style={{ borderColor: syncStatus.codeforces === "verified" ? "rgba(16, 185, 129, 0.2)" : "" }}
                />

                {syncStatus.codeforces === "verified" ? (
                  <button className="btn btn-danger btn-sm" style={{ padding: "0 1rem" }} onClick={() => handleUnlink("codeforces")}>Unlink</button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: "0 1rem", fontSize: "0.75rem" }}
                    onClick={() => handleVerifySync("codeforces")}
                    disabled={syncStatus.codeforces === "verifying" || !handles.codeforces.trim()}
                  >
                    {syncStatus.codeforces === "verifying" ? <RefreshCw size={12} className="pulse-green" /> : null}
                    <span>{syncStatus.codeforces === "verifying" ? "Syncing..." : "Verify & Sync"}</span>
                  </button>
                )}
              </div>
              {syncStatus.codeforces === "verified" && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle size={10} /> Handle verified. Stats synced!
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Right Column: Preferences + Danger Zone */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Notification preferences */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={16} style={{ color: "var(--primary-light)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Notification Settings</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={notifs.emailAlerts}
                onChange={() => setNotifs({ ...notifs, emailAlerts: !notifs.emailAlerts })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>Send contest reminders to my email</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={notifs.browserAlerts}
                onChange={() => setNotifs({ ...notifs, browserAlerts: !notifs.browserAlerts })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>Enable Chrome browser desktop push alerts</span>
            </label>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Default Alert Timing</label>
            <select
              value={notifs.reminderTime}
              onChange={(e) => setNotifs({ ...notifs, reminderTime: e.target.value })}
              style={{ fontSize: "0.85rem", padding: "0.5rem", height: "38px" }}
            >
              <option value="10">10 minutes before start</option>
              <option value="30">30 minutes before start</option>
              <option value="60">1 hour before start</option>
              <option value="120">2 hours before start</option>
            </select>
          </div>
        </div>

        {/* Change password */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <KeyRound size={16} style={{ color: "var(--text-warning)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Change Password</h3>
          </div>

          <form style={{ gap: "0.85rem" }} onSubmit={(e) => { e.preventDefault(); alert("Password updated successfully!"); }}>
            <input type="password" placeholder="Current password" required />
            <input type="password" placeholder="New password (min 6 chars)" required />
            <button type="submit" className="btn-secondary btn-sm" style={{ alignSelf: "flex-start" }}>Update Password</button>
          </form>
        </div>

        {/* Danger zone actions */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", rgba: "rgba(239, 68, 68, 0.02)", borderColor: "rgba(239, 68, 68, 0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={16} style={{ color: "var(--text-danger)" }} />
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-danger)" }}>Danger Zone</h3>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>
            Once you delete your account, there is no going back. All solved statistics logs and extension history will be deleted.
          </p>

          <button className="btn btn-danger btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => confirm("Are you sure you want to delete your Algo Mentor account?") && alert("Account simulation terminated.")}>
            Delete Account
          </button>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .settings-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Settings() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Settings;
