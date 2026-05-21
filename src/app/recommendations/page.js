"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Sparkles,
  Brain,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  TrendingUp,
  Target,
  Zap,
  Info,
  ChevronRight,
  Award,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  BookOpen
} from "lucide-react";

function RecommendationsContent() {
  const router = useRouter();
  
  // Local state for the selected node in the study path roadmap.
  // Defaults to Step 3 (Sliding Window), which is the user's current focus topic.
  const [selectedStep, setSelectedStep] = useState(3);
  
  // Custom mock database for the study path steps
  const steps = [
    {
      id: 1,
      title: "Arrays & Hashing",
      status: "completed", // "completed", "active", "locked"
      solved: 184,
      total: 200,
      badge: "Mastered",
      badgeClass: "badge-easy",
      tag: "arrays",
      accuracy: "92%",
      avgComplexity: "O(1) space, O(N) time",
      description: "Fundamental array traversal, dynamic scaling, hash tables, frequency analysis, and running prefix partitions.",
      problems: [
        { id: 1, title: "Two Sum", difficulty: "Easy", solved: true, url: "https://leetcode.com/problems/two-sum/" },
        { id: 9, title: "Product of Array Except Self", difficulty: "Medium", solved: true, url: "https://leetcode.com/problems/product-of-array-except-self/" }
      ],
      aiCoachNote: "Your array hashing efficiency is outstanding. Solve speed averages 11 minutes (faster than 92% of users). Keep up the O(N) linear time intuition!"
    },
    {
      id: 2,
      title: "Two Pointers",
      status: "completed",
      solved: 62,
      total: 80,
      badge: "Strong",
      badgeClass: "badge-easy",
      tag: "two pointers",
      accuracy: "78%",
      avgComplexity: "O(1) space, O(N) time",
      description: "Linear scanning with multiple index points: head-to-tail convergence, fast & slow pointers, and containment intervals.",
      problems: [
        { id: 12, title: "Container With Most Water", difficulty: "Medium", solved: true, url: "https://leetcode.com/problems/container-with-most-water/" },
        { id: 99, title: "Valid Palindrome", difficulty: "Easy", solved: true, url: "https://leetcode.com/problems/valid-palindrome/" }
      ],
      aiCoachNote: "Good structural logic on opposite pointer convergences. Minor TLE risks resolved. You are ready to apply these elements to dynamic subsegment intervals."
    },
    {
      id: 3,
      title: "Sliding Window",
      status: "active",
      solved: 14,
      total: 50,
      badge: "Active Focus",
      badgeClass: "badge-medium",
      tag: "sliding window",
      accuracy: "40%",
      avgComplexity: "O(K) space, O(N) time",
      description: "Contiguous subsegments of dynamic or fixed length, rolling aggregates, window frequency tables, and monotonic queues.",
      problems: [
        { id: 2, title: "Sliding Window Maximum", difficulty: "Hard", solved: false, url: "https://leetcode.com/problems/sliding-window-maximum/" },
        { id: 101, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", solved: false, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }
      ],
      aiCoachNote: "Your submission errors stem from loop reset redundancies. You are frequently re-scanning segments O(N²). Transition to dynamic sliding bounds with a sliding frequency hash map to achieve stable linear O(N) performance."
    },
    {
      id: 4,
      title: "Binary Search",
      status: "locked",
      solved: 8,
      total: 60,
      badge: "Locked",
      badgeClass: "badge-hard",
      tag: "binary search",
      accuracy: "15%",
      avgComplexity: "O(1) space, O(log N) time",
      description: "Logarithmic split searching in sorted structures, checking decision spaces (Binary Search on Answer), and rotated pivot scales.",
      problems: [
        { id: 11, title: "Watering Flowers", difficulty: "Div2", solved: false, url: "https://codeforces.com/problemset/problem/617/D" },
        { id: 102, title: "Search in Rotated Sorted Array", difficulty: "Medium", solved: false, url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" }
      ],
      aiCoachNote: "Requires sliding window completion to guarantee stable pointer limits. Mastery of search interval bisecting will unlock logarithmic optimization boundaries."
    },
    {
      id: 5,
      title: "Dynamic Programming",
      status: "locked",
      solved: 48,
      total: 150,
      badge: "Locked",
      badgeClass: "badge-hard",
      tag: "DP",
      accuracy: "30%",
      avgComplexity: "O(N) space, O(N) time",
      description: "State decomposition, recursive memoization (top-down), bottom-up 1D/2D tabulation, Knapsack variations, and edit string distances.",
      problems: [
        { id: 3, title: "Edit Distance", difficulty: "Hard", solved: false, url: "https://leetcode.com/problems/edit-distance/" },
        { id: 6, title: "Minimum Path Sum", difficulty: "Medium", solved: false, url: "https://leetcode.com/problems/minimum-path-sum/" }
      ],
      aiCoachNote: "Your high recursion overlap creates exponential workloads. Sliding window state-cache mastery is highly recommended to stabilize sub-problem state transitions before starting hard DP models."
    }
  ];

  const activeStepData = steps.find(s => s.id === selectedStep) || steps[2];

  const handleConsultCoach = (topic) => {
    router.push(`/mentor?query=${encodeURIComponent(`Hey Algo Mentor, I need a detailed conceptual review of ${topic} algorithms. What are the key patterns to master?`)}`);
  };

  const handleLaunchProblems = (tag) => {
    router.push(`/problems?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. Header AI Diagnostic Card */}
      <div className="glass-card" style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)",
        borderColor: "rgba(99, 102, 241, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary-light)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>
              <Brain size={22} className="pulse-green" style={{ color: "var(--primary-light)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", margin: "0" }}>AI Diagnostic Synopsis</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0" }}>Dynamic calibration based on recent submission analytics</p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Focus</span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-warning)", fontWeight: "600" }}>Step 3: Sliding Window</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Path Progress</span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-success)", fontWeight: "600" }}>40% Complete</span>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }} />

        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.5", margin: "0" }}>
          💡 <span style={{ color: "var(--text-secondary)" }}>Coach Assessment:</span> "We analyzed your last 15 submissions. Your recursion complexity scales exponentially due to recursive overlapping, leading to a <span style={{ color: "var(--text-danger)", fontWeight: "600" }}>40% TLE rate</span>. To establish structural stability, we have paused dynamic programming. Focus heavily on <span style={{ color: "var(--text-warning)", fontWeight: "600" }}>Sliding Window</span> linear allocations to master state sliding and caches before attempting peak challenges."
        </p>
      </div>

      {/* 2. Main Double-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }} className="recommendations-grid">
        
        {/* Left Column: Visual Roadmap Tree */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "fit-content" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Learning Pathway</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0" }}>Click a node to inspect diagnostic targets and syllabus checklists</p>
          </div>

          {/* Glowing vertical connector structure */}
          <div style={{ position: "relative", paddingLeft: "2.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* The vertical timeline connector bar */}
            <div style={{
              position: "absolute",
              left: "14px",
              top: "20px",
              bottom: "20px",
              width: "4px",
              background: "linear-gradient(to bottom, var(--success) 0%, var(--success) 45%, var(--warning) 52%, rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0.05) 100%)",
              borderRadius: "2px",
              zIndex: "1"
            }} />

            {steps.map((step) => {
              const isActive = selectedStep === step.id;
              
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step.id)}
                  className={`roadmap-step-item ${isActive ? "step-item-active" : ""}`}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    border: `1px solid ${isActive ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.02)"}`,
                    background: isActive ? "rgba(99, 102, 241, 0.05)" : "rgba(8, 11, 17, 0.3)",
                    transition: "all var(--transition-normal)",
                    boxShadow: isActive ? "0 4px 16px rgba(0, 0, 0, 0.3)" : "none"
                  }}
                >
                  {/* Indicator Dot on the Line */}
                  <div style={{
                    position: "absolute",
                    left: "-31px",
                    top: "18px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: step.status === "completed" ? "var(--success)" : step.status === "active" ? "var(--warning)" : "var(--bg-card)",
                    border: `3px solid ${
                      step.status === "completed" ? "rgba(16, 185, 129, 0.25)" :
                      step.status === "active" ? "rgba(245, 158, 11, 0.35)" : "var(--border-ice)"
                    }`,
                    zIndex: "2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: step.status === "active" ? "0 0 12px rgba(245, 158, 11, 0.8)" : "none"
                  }}>
                    {step.status === "completed" && <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "white" }} />}
                    {step.status === "active" && <div className="pulse-yellow" style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "white" }} />}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>STEP 0{step.id}</span>
                    <span className={`badge ${step.badgeClass}`} style={{ fontSize: "0.55rem", padding: "0.15rem 0.45rem" }}>
                      {step.badge}
                    </span>
                  </div>

                  <h4 style={{
                    fontSize: "0.95rem",
                    margin: "0",
                    color: step.status === "locked" ? "var(--text-secondary)" : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    {step.status === "locked" ? (
                      <Lock size={12} style={{ color: "var(--text-muted)" }} />
                    ) : (
                      <Unlock size={12} style={{ color: step.status === "completed" ? "var(--success)" : "var(--warning)" }} />
                    )}
                    {step.title}
                  </h4>

                  <div style={{ display: "flex", gap: "8px", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: step.status === "completed" ? "var(--text-success)" : "var(--text-secondary)" }}>
                      {step.solved}/{step.total} Solved
                    </span>
                    <span>•</span>
                    <span>{step.accuracy} Accuracy</span>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Right Column: AI Diagnostic Detail Panel */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Header */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Target Step Breakdown
              </span>
              <h3 style={{ fontSize: "1.3rem", margin: "4px 0 0 0", color: "white" }}>
                Step 0{activeStepData.id}: {activeStepData.title}
              </h3>
            </div>
            
            <div className={`badge ${activeStepData.badgeClass}`} style={{ padding: "0.3rem 0.75rem" }}>
              {activeStepData.status === "completed" ? "Completed Module" : activeStepData.status === "active" ? "Active Focus" : "Locked Pathway"}
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4" }}>
            {activeStepData.description}
          </p>

          {/* Quick Metrics Split */}
          <div className="grid-3" style={{ gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(8,11,17,0.4)", border: "1px solid var(--border-ice)", textAlign: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Module Solves</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: activeStepData.status === "completed" ? "var(--text-success)" : "white" }}>
                {activeStepData.solved} / {activeStepData.total}
              </span>
            </div>
            <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(8,11,17,0.4)", border: "1px solid var(--border-ice)", textAlign: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Calibration Accuracy</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: activeStepData.accuracy === "92%" || activeStepData.accuracy === "78%" ? "var(--text-success)" : "var(--text-warning)" }}>
                {activeStepData.accuracy}
              </span>
            </div>
            <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(8,11,17,0.4)", border: "1px solid var(--border-ice)", textAlign: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Average Complexity</span>
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-info)", display: "block", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                {activeStepData.avgComplexity.split(",")[0]}
              </span>
            </div>
          </div>

          {/* AI Coach Detailed Note */}
          <div style={{
            padding: "0.9rem",
            borderRadius: "12px",
            background: "rgba(13, 18, 32, 0.4)",
            borderLeft: `4px solid ${
              activeStepData.status === "completed" ? "var(--success)" :
              activeStepData.status === "active" ? "var(--warning)" : "var(--border-ice)"
            }`,
            display: "flex",
            gap: "0.65rem"
          }}>
            <Info size={16} style={{ color: activeStepData.status === "completed" ? "var(--success)" : activeStepData.status === "active" ? "var(--warning)" : "var(--text-muted)", flexShrink: "0", marginTop: "2px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "white" }}>AI Coach Diagnostic</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                {activeStepData.aiCoachNote}
              </span>
            </div>
          </div>

          {/* Curated Problem Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)" }}>
              Curated Diagnostic Practice Checklist
            </span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {activeStepData.problems.map((prob) => (
                <div
                  key={prob.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "10px",
                    background: "rgba(8,11,17,0.3)",
                    border: "1px solid var(--border-ice)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {prob.solved ? (
                      <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                    ) : (
                      <Play size={14} style={{ color: "var(--warning)" }} />
                    )}
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "white" }}>{prob.title}</span>
                    <span className={`badge ${prob.difficulty === "Easy" ? "badge-easy" : prob.difficulty === "Hard" ? "badge-hard" : "badge-medium"}`} style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => handleConsultCoach(prob.title)}
                    >
                      <MessageSquare size={10} />
                      <span>Review Concept</span>
                    </button>
                    
                    <a
                      href={prob.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn btn-sm ${prob.solved ? "btn-secondary" : "btn-primary"}`}
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>{prob.solved ? "Review Solution" : "Solve"}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }} className="action-buttons-grid">
            <button
              className="btn btn-secondary"
              onClick={() => handleConsultCoach(activeStepData.title)}
              style={{ padding: "0.6rem", fontSize: "0.8rem", width: "100%" }}
            >
              <Brain size={14} style={{ color: "var(--primary-light)" }} />
              Consult Conceptual Coach
            </button>
            
            <button
              className="btn btn-primary"
              onClick={() => handleLaunchProblems(activeStepData.tag)}
              style={{ padding: "0.6rem", fontSize: "0.8rem", width: "100%" }}
            >
              <BookOpen size={14} />
              Filter Problems Library
            </button>
          </div>

        </div>

      </div>

      {/* Local Responsive CSS styles */}
      <style jsx global>{`
        .roadmap-step-item:hover {
          background: rgba(99, 102, 241, 0.08) !important;
          border-color: rgba(99, 102, 241, 0.25) !important;
          transform: translateX(4px);
        }
        
        .step-item-active {
          transform: scale(1.01);
        }

        @media (max-width: 1024px) {
          .recommendations-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .action-buttons-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}

function Recommendations() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RecommendationsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Recommendations;
