"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ChevronLeft, List, RefreshCw, Trash2, ExternalLink
} from "lucide-react";
import { fetchRevisionItems, deleteRevisionItem } from "@/services/revisionService";
import "../Revision.css";

function RevisionListContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRevisionItems();
      if (data.success) {
        setItems(data.allRevisionItems || []);
      }
    } catch (err) {
      console.error("Failed to load revision items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this problem from the Revision Hub?")) return;
    try {
      const res = await deleteRevisionItem(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <RefreshCw size={24} className="pulse-yellow" style={{ animation: "spin 2s linear infinite" }} />
        <span style={{ marginLeft: "10px" }}>Loading Tracked Problems...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px", margin: "0" }}>
          <List size={22} style={{ color: "var(--primary-light)" }} />
          All Tracked Problems
        </h3>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/revision")}
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <ChevronLeft size={16} />
          <span>Back to Hub</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="rev-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-ice)", background: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Problem</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Platform</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Difficulty</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Mastery</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Next Review</th>
                <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No problems tracked in Revision Hub yet.
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const nextReview = new Date(item.nextReviewDate);
                  const isDue = nextReview <= new Date();
                  
                  return (
                    <tr key={item._id} style={{ borderBottom: "1px solid var(--border-ice)", transition: "background 0.2s" }} className="rev-table-row">
                      <td style={{ padding: "1rem" }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "white", textDecoration: "none", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                          {item.title}
                          <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
                        </a>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span className={`badge ${item.platform === "LeetCode" ? "badge-leetcode" : "badge-codeforces"}`} style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}>
                          {item.platform}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span className={`badge ${item.difficulty === "Easy" ? "badge-easy" : item.difficulty === "Hard" ? "badge-hard" : "badge-medium"}`} style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${item.masteryScore}%`, height: "100%", background: item.masteryScore > 75 ? "var(--success)" : item.masteryScore > 40 ? "var(--warning)" : "var(--danger)" }}></div>
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.masteryScore}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontSize: "0.85rem", color: isDue ? "var(--text-warning)" : "var(--text-secondary)", fontWeight: isDue ? "600" : "400" }}>
                          {isDue ? "Due Now" : nextReview.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                            title="Open Problem"
                          >
                            <span>Open</span>
                            <ExternalLink size={12} />
                          </a>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "0.4rem", color: "var(--text-danger)", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                            title="Remove problem"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevisionList() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RevisionListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default RevisionList;
