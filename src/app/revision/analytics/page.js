"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ChevronLeft, BarChart2, AlertTriangle, BookOpen, 
  ArrowRight, Award, Brain, Star, CheckCircle, RefreshCw, Play
} from "lucide-react";
import { fetchRevisionItems } from "@/services/revisionService";
import "../Revision.css";

const TOPIC_SUMMARIES = {
  "dp": {
    title: "Dynamic Programming",
    summary: "DP solves complex problems by breaking them into overlapping subproblems, solving each once, and caching results. Key focuses: identifying optimal substructures, defining state arrays (dp[i]), and deriving state transition logic."
  },
  "graphs": {
    title: "Graph Algorithms",
    summary: "Graph algorithms analyze networks of nodes connected by edges. Traversals like BFS (Breadth-First Search) find shortest paths on unweighted graphs, while DFS (Depth-First Search) detects cycles and reachability."
  },
  "trees": {
    title: "Tree Structures",
    summary: "Trees are acyclic hierarchical structures. Mastery includes traversals (pre-order, post-order, in-order, level-order) and utilizing Binary Search Tree properties for O(log N) operations."
  },
  "strings": {
    title: "String Processing",
    summary: "String manipulation involves pattern matching, character counting, and subsequence checks. Utilizes dynamic structures, sliding windows, and suffix arrays to optimize searches."
  },
  "arrays": {
    title: "Array Manipulation",
    summary: "Arrays are contiguous blocks of data. Core techniques include two pointers, prefix sums, binary search lookups, and frequency counters to avoid nested O(N^2) loops."
  }
};

function TopicAnalyticsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    allRevisionItems: [],
    overallReadinessScore: 0,
    topicScores: {},
    weakTopics: []
  });

  // Guided session state
  const [activeGuidedTopic, setActiveGuidedTopic] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetchRevisionItems();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  // Filter problems for guided session
  const getGuidedProblems = (topic) => {
    return data.allRevisionItems.filter(item => 
      item.tags.map(t => t.trim().toLowerCase()).includes(topic.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <RefreshCw size={24} className="pulse-yellow" style={{ animation: "spin 2s linear infinite" }} />
        <span style={{ marginLeft: "10px" }}>Compiling Topic Mastery Metrics...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/revision")}
          style={{ padding: "0.35rem 0.65rem", borderRadius: "8px" }}
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h2 style={{ fontSize: "1.3rem", margin: "0" }}>Topic Revision Analytics</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: "0" }}>
            Detailed mastery reports and guided weak-area focus sessions
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-3" style={{ alignItems: "start" }}>
        
        {/* Left Column: Topic Mastery Cards (Takes 2 Columns on desktop) */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "1.25rem" }} className="rev-analytics-dashboard">
          
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", borderBottom: "1px solid var(--border-ice)", paddingBottom: "0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 size={18} style={{ color: "var(--primary-light)" }} />
              Active Topic Performance Map
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {Array.from(new Set([
                "arrays", "strings", "trees", "graphs", "dp", 
                "binary search", "two pointers", "sliding window", "backtracking", "linked list", "stack", "greedy", "heap",
                ...(Object.keys(data.topicScores || {}))
              ])).map((topic) => {
                const score = data.topicScores[topic] !== undefined ? data.topicScores[topic] : 100;
                const isWeak = score < 60;
                
                // Formatting the display topic
                let displayTopic = topic;
                if (topic === "dp") displayTopic = "Dynamic Programming";
                else if (topic === "dfs") displayTopic = "DFS";
                else if (topic === "bfs") displayTopic = "BFS";
                else {
                  displayTopic = topic.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                }
                const problemsInTopic = getGuidedProblems(topic);

                return (
                  <div key={topic} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-ice)", borderRadius: "12px", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div>
                        <h4 style={{ fontSize: "0.95rem", margin: "0", color: "white" }}>{displayTopic}</h4>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {problemsInTopic.length} problem{problemsInTopic.length !== 1 ? "s" : ""} Solved & Tracked
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: "700", color: isWeak ? "var(--text-danger)" : "var(--text-success)" }}>
                          {score}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="rev-topic-progress-bar-bg" style={{ height: "6px", marginBottom: "0.75rem" }}>
                      <div 
                        className="rev-topic-progress-bar-fill" 
                        style={{ 
                          width: `${score}%`,
                          background: isWeak ? "linear-gradient(90deg, #f87171, #ef4444)" : "var(--primary-gradient)"
                        }} 
                      />
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        {isWeak ? (
                          <span className="rev-topic-weak-tag" style={{ margin: "0" }}>Weak Area Detected</span>
                        ) : (
                          <span className="badge badge-easy" style={{ fontSize: "0.6rem", textTransform: "capitalize" }}>Mastered</span>
                        )}
                      </div>
                      
                      {problemsInTopic.length > 0 && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveGuidedTopic(topic)}
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <span>Guide Session</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Guided Session Setup & Topic Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Active Guide Card */}
          {activeGuidedTopic ? (
            <div className="glass-card" style={{ borderColor: "var(--primary-light)", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(13,18,32,0.6) 100%)" }}>
              <h3 style={{ fontSize: "1.05rem", color: "white", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px" }}>
                <Brain size={16} style={{ color: "var(--primary-light)" }} />
                Guided Revision Session
              </h3>

              <div style={{ margin: "0 0 1rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Topic Focus</span>
                <h4 style={{ fontSize: "1.1rem", margin: "2px 0 0", color: "white" }}>
                  {TOPIC_SUMMARIES[activeGuidedTopic]?.title || activeGuidedTopic}
                </h4>
              </div>

              {/* 2-minute DP/Graph summary */}
              <div style={{ background: "rgba(8,11,17,0.4)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-ice)", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-warning)", fontWeight: "600", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <BookOpen size={12} />
                  2-Minute Concept Summary
                </span>
                <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {TOPIC_SUMMARIES[activeGuidedTopic]?.summary || "spaced-repetition review of this topic."}
                </p>
              </div>

              {/* Problem list check list */}
              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Queue Checklist ({getGuidedProblems(activeGuidedTopic).length} items)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
                  {getGuidedProblems(activeGuidedTopic).map((prob) => (
                    <div 
                      key={prob._id} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "0.5rem 0.6rem", 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid var(--border-ice)",
                        borderRadius: "6px" 
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "white" }}>{prob.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-success)" }}>Mastery {prob.masteryScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveGuidedTopic(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => router.push(`/mentor?topic=${activeGuidedTopic}`)}
                  style={{ flex: 2, display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}
                >
                  <Play size={12} fill="white" />
                  <span>Start Guide</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standby Card */
            <div className="glass-card" style={{ textAlign: "center", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              <Award size={36} style={{ color: "var(--text-secondary)", alignSelf: "center" }} />
              <h4 style={{ fontSize: "0.9rem", color: "white", margin: "0" }}>Guided Sessions Standby</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0" }}>
                Select a topic on the left to start a focused 2-minute concept refresh and guided checklist session.
              </p>
            </div>
          )}

          {/* Weak Topics Alert Card */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ fontSize: "0.85rem", color: "white", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
              <AlertTriangle size={14} style={{ color: "var(--text-danger)" }} />
              Weak Areas Diagnostic
            </h4>
            
            {data.weakTopics.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-secondary)" }}>
                  Your average mastery is low under these concepts:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {data.weakTopics.map(wt => (
                    <span key={wt} className="rev-topic-weak-tag" style={{ margin: "0" }}>
                      {wt === "dp" ? "Dynamic Programming" : wt.charAt(0).toUpperCase() + wt.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "0.75rem", margin: "0", color: "var(--text-secondary)" }}>
                No critical weakness areas detected. Your performance profile looks highly balanced!
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

function TopicAnalytics() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TopicAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default TopicAnalytics;
