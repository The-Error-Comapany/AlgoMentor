"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { User, KeyRound, Share2, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";

function SettingsContent() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: ""
  });

  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: ""
  });

  const [syncStatus, setSyncStatus] = useState({
    leetcode: "unlinked", // verified | unlinked | verifying
    codeforces: "unlinked"
  });

  const [loadingPlatform, setLoadingPlatform] = useState(null);

  // Load registered name and handles from global AuthContext user object
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        avatar: (user.name || "A").charAt(0).toUpperCase()
      });
      setHandles({
        leetcode: user.lcHandle || "",
        codeforces: user.cfHandle || ""
      });
      setSyncStatus({
        leetcode: user.lcHandle ? "verified" : "unlinked",
        codeforces: user.cfHandle ? "verified" : "unlinked"
      });
    }
  }, [user]);

  const handleVerifySync = async (platform) => {
    const handle = handles[platform].trim();
    if (!handle) return;

    setLoadingPlatform(platform);
    setSyncStatus(prev => ({ ...prev, [platform]: "verifying" }));

    try {
      const token = localStorage.getItem("accessToken");

      // 1. Update handle in database via PUT /api/auth/me
      const profileRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          [platform === "leetcode" ? "lcHandle" : "cfHandle"]: handle
        })
      });
      
      const profileData = await profileRes.json();
      if (!profileData.success) {
        throw new Error(profileData.message || "Failed to link handle");
      }
      setUser(profileData.user);

      // 2. Trigger synchronous backend API synchronization
      const syncRes = await fetch("/api/sync/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user?._id || profileData.user?._id,
          [platform === "leetcode" ? "lcHandle" : "cfHandle"]: handle
        })
      });

      const syncData = await syncRes.json();
      if (!syncData.success) {
        throw new Error(syncData.error || `Could not verify handle on ${platform}`);
      }

      setSyncStatus(prev => ({ ...prev, [platform]: "verified" }));
      alert(`${platform === "leetcode" ? "LeetCode" : "Codeforces"} handle linked and synchronized successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.message || `Failed to verify/sync ${platform}`);
      setSyncStatus(prev => ({ ...prev, [platform]: "unlinked" }));
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleUnlink = async (platform) => {
    if (!confirm(`Are you sure you want to unlink your ${platform === "leetcode" ? "LeetCode" : "Codeforces"} handle?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const profileRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          [platform === "leetcode" ? "lcHandle" : "cfHandle"]: ""
        })
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setUser(profileData.user);
        setSyncStatus(prev => ({ ...prev, [platform]: "unlinked" }));
        setHandles(prev => ({ ...prev, [platform]: "" }));
        alert(`${platform === "leetcode" ? "LeetCode" : "Codeforces"} handle unlinked successfully.`);
      } else {
        alert(profileData.message || "Failed to unlink handle");
      }
    } catch (err) {
      console.error(err);
      alert("Error unlinking handle");
    }
  };

  const saveProfileInfo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const profileRes = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("userName", profile.name);
        }
        alert("Profile information saved successfully!");
      } else {
        alert(profileData.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      <div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: "600", marginBottom: "0.25rem" }}>Platform Settings</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0" }}>
          Manage your personal details, synchronize competitive handles, and secure your account
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="settings-grid-layout">
        
        {/* Left Column: Profile Info & Platform Handles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Section 1: Profile Info */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} style={{ color: "var(--primary-light)" }} />
              <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Profile Information</h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem" }}>
              <div style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                background: "var(--primary-gradient)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "white", 
                fontWeight: "700", 
                fontSize: "1.3rem", 
                border: "2px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 12px rgba(99, 102, 241, 0.3)"
              }}>
                {profile.name.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Profile Avatar</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>Auto-generated from your display name</span>
              </div>
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={saveProfileInfo}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Display Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", marginTop: "0.25rem", padding: "0.5rem 1.25rem" }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Section 2: Platform Handles */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Share2 size={18} style={{ color: "var(--text-info)" }} />
              <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Platform Handles</h3>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>
              Synchronize your handles to sync solved stats, contest ratings, and extension analysis.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* LeetCode Sync */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", color: "#ffa116", fontWeight: "600" }}>LeetCode Handle</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="LeetCode Username"
                    value={handles.leetcode}
                    onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                    disabled={syncStatus.leetcode === "verified" || syncStatus.leetcode === "verifying"}
                    style={{ borderColor: syncStatus.leetcode === "verified" ? "rgba(16, 185, 129, 0.3)" : "" }}
                  />
                  
                  {syncStatus.leetcode === "verified" ? (
                    <button className="btn btn-danger btn-sm" style={{ padding: "0 1rem", fontSize: "0.75rem" }} onClick={() => handleUnlink("leetcode")}>Unlink</button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: "0 1rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
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
                    <CheckCircle size={10} /> Active connected handle: verified and operational
                  </span>
                )}
                {syncStatus.leetcode === "unlinked" && (
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>
                    Not linked. SOLVED metrics will be unavailable in dashboard.
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
                    style={{ borderColor: syncStatus.codeforces === "verified" ? "rgba(16, 185, 129, 0.3)" : "" }}
                  />

                  {syncStatus.codeforces === "verified" ? (
                    <button className="btn btn-danger btn-sm" style={{ padding: "0 1rem", fontSize: "0.75rem" }} onClick={() => handleUnlink("codeforces")}>Unlink</button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: "0 1rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
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
                    <CheckCircle size={10} /> Active connected handle: verified and operational
                  </span>
                )}
                {syncStatus.codeforces === "unlinked" && (
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>
                    Not linked. RATING metrics will be unavailable in profile summary.
                  </span>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Section 3: Account Actions (Change Password + Danger Zone) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem" }}>
              <KeyRound size={18} style={{ color: "var(--text-warning)" }} />
              <h3 style={{ fontSize: "1.1rem", margin: "0" }}>Account Security & Actions</h3>
            </div>

            {/* Change Password Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ fontSize: "0.85rem", color: "white", margin: "0", fontWeight: "600" }}>Change Account Password</h4>
              <form style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }} onSubmit={(e) => { e.preventDefault(); alert("Password updated successfully!"); }}>
                <input type="password" placeholder="Current password" required style={{ height: "38px", fontSize: "0.85rem" }} />
                <input type="password" placeholder="New password (min 6 characters)" required style={{ height: "38px", fontSize: "0.85rem" }} />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", padding: "0.5rem 1rem", fontSize: "0.75rem" }}>
                  Update Password
                </button>
              </form>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-ice)" }} />

            {/* Danger Zone Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle size={16} style={{ color: "var(--text-danger)" }} />
                <h4 style={{ fontSize: "0.85rem", color: "var(--text-danger)", margin: "0", fontWeight: "600" }}>Danger Zone</h4>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4" }}>
                Deleting your account will purge all synchronization handles, solved diagnostics history, and browser cache. This action is irreversible.
              </p>

              <button 
                className="btn btn-danger btn-sm" 
                style={{ alignSelf: "flex-start", padding: "0.5rem 1rem", fontSize: "0.75rem" }} 
                onClick={() => confirm("Are you sure you want to delete your Algo Mentor account?") && alert("Account simulation terminated.")}
              >
                Delete Account
              </button>
            </div>

          </div>

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
