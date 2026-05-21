"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MessageSquare,
  Send,
  Sparkles,
  Terminal,
  Cpu,
  Brain,
  Code2,
  Trash2,
  ChevronRight,
  User,
  PanelRightOpen,
  PanelRightClose
} from "lucide-react";

function MentorContent() {
  const searchParams = useSearchParams();
  const initProblem = searchParams.get("problem");
  const initPlatform = searchParams.get("platform");

  // Chat conversation logs state
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey Aishvary! I've loaded your DSA progress. I see you've mastered **Arrays & Hashing (92%)** but could use some work on **Dynamic Programming (30%)** and **Recursion State Transitions**.\n\nHow can I help you sharpen your skills today? I can suggest problems, explain algorithms, or review your code!",
      time: "11:15 AM"
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Split Panel state (Code Review Editor)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLang, setEditorLang] = useState("cpp");
  const [code, setCode] = useState(
`// Prefilled Suboptimal Fibonacci (Click 'Review' to analyze complexity)
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`
  );
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load problem context from URL search parameters if passed (e.g. from problems page "Ask AI")
  useEffect(() => {
    if (initProblem) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `Hey, I need help with the problem "${initProblem}" on ${initPlatform || "LeetCode"}.`,
          time: "11:16 AM"
        },
        {
          sender: "ai",
          text: `I've loaded the metadata for **"${initProblem}"**. It's classified as a **Hard** sliding window challenge.\n\nHere is a conceptual hint to get you started:\n1. Maintain a deque of indices representing elements within the window.\n2. Ensure the deque stores elements in a decreasing order of their values.\n3. Try to write down your code, or paste it in the right-hand **Code Reviewer** panel so we can evaluate its time/space complexity together!`,
          time: "11:16 AM"
        }
      ]);
      setEditorOpen(true);
    }
  }, [initProblem, initPlatform]);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const userMsg = { sender: "user", text: textToSend, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // AI typing simulated response
    setTimeout(() => {
      let aiResponseText = "";
      const textLower = textToSend.toLowerCase();

      if (textLower.includes("study next") || textLower.includes("roadmap") || textLower.includes("what should i")) {
        aiResponseText = "Based on your analytics, you should study **Sliding Window Problems** first to bridge the gap between Arrays and DP. Try practicing *'Sliding Window Maximum'* or *'Longest Substring Without Repeating Characters'*. I've highlighted these in your study path!";
      } else if (textLower.includes("dynamic programming") || textLower.includes("dp")) {
        aiResponseText = "Dynamic Programming (DP) is just recursion with memoization! Since your strength is Arrays, you can think of DP as filling up a 1D or 2D array representing subproblems. Let's start with *'Climbing Stairs'* (1D array) then move to *'Unique Paths'* (2D array).";
      } else {
        aiResponseText = "That's an interesting approach! Make sure you evaluate your recursion base cases. If you want me to analyze the exact time and space complexity of your algorithm, paste your code in the **Code Review panel** (click the button on the top right) and let's run an optimization trace.";
      }

      const aiMsg = { sender: "ai", text: aiResponseText, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1500);
  };

  const handleCodeReview = () => {
    setEvaluating(true);
    setAnalysisResult(null);

    // Simulated Code Complexity Evaluation
    setTimeout(() => {
      setAnalysisResult({
        timeComplexity: "O(2^N)",
        spaceComplexity: "O(N) recursion stack",
        optimality: "Sub-Optimal (Highly Redundant)",
        verdict: "This is a classic exponential recursion. It computes fib(n-1) and fib(n-2) independently, resulting in duplicated calculations.",
        optimizedCode: 
`// Optimized Fibonacci using Dynamic Programming (Memoization)
int memo[1000] = {0};
int fib(int n) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
} // Time Complexity: O(N) | Space Complexity: O(N)`,
        suggestion: "By adding an array `memo` to store intermediate calculations, you reduce the time complexity from O(2^N) to O(N) linear time, which easily passes Codeforces thresholds."
      });
      setEvaluating(false);

      // Append review notification inside chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `I've analyzed your submitted code in the reviewer! It features a sub-optimal **O(2^N) Time Complexity** due to redundant recursive branches. Let's optimize it using memoization or tabulating DP to run in **O(N) Time Complexity**! Check the Code Review panel details.`,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        }
      ]);
    }, 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "Conversation history cleared. I'm ready for new algorithms! What should we solve next?",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: editorOpen ? "1fr 450px" : "1fr", height: "calc(100vh - 130px)", transition: "all var(--transition-normal)" }} className="mentor-layout">
      
      {/* 1. Main Chat Area */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-darker)", borderRadius: "16px", border: "1px solid var(--border-ice)", overflow: "hidden", position: "relative" }}>
        
        {/* Chat Header */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-ice)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Brain size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", margin: "0" }}>Algo Mentor AI</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "var(--text-success)" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", animation: "pulse-glowing 2s infinite" }} />
                <span>Context Loaded: Arrays 92% | DP 30%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={clearChat} title="Clear conversation logs">
              <Trash2 size={14} />
            </button>
            <button
              className={`btn btn-sm ${editorOpen ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setEditorOpen(!editorOpen)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              {editorOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              <span>Code Reviewer</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flexGrow: "1", padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {messages.map((m, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                flexDirection: m.sender === "user" ? "row-reverse" : "row"
              }}
            >
              {/* Avatar Icon */}
              <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: m.sender === "user" ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" : "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "700",
                flexShrink: "0"
              }}>
                {m.sender === "user" ? <User size={14} /> : <Brain size={14} />}
              </div>

              {/* Speech bubble */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{
                  padding: "0.85rem 1.1rem",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                  backgroundColor: m.sender === "user" ? "var(--primary)" : "var(--bg-card)",
                  color: "white",
                  border: m.sender === "user" ? "none" : "1px solid var(--border-ice)",
                  borderRadiusTopleft: m.sender === "user" ? "14px" : "0",
                  borderRadiusTopright: m.sender === "user" ? "0" : "14px",
                  whiteSpace: "pre-line"
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", alignSelf: m.sender === "user" ? "flex-end" : "flex-start" }}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: "flex", gap: "0.75rem", alignSelf: "flex-start" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: "0" }}>
                <Brain size={14} />
              </div>
              <div className="glass-card" style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse-glowing 1s infinite" }} />
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse-glowing 1s infinite 0.2s" }} />
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: "pulse-glowing 1s infinite 0.4s" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Conversation prompts at the bottom */}
        <div style={{ padding: "0.5rem 1.5rem", display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
          {[
            "What should I study next? 🚀",
            "Explain Dynamic Programming concepts 🧠",
            "Review dynamic programming memoization 💡"
          ].map((promptText) => (
            <span
              key={promptText}
              onClick={() => handleSend(promptText.replace(/[🚀🧠💡]/g, "").trim())}
              style={{
                fontSize: "0.7rem",
                padding: "0.3rem 0.6rem",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-ice)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseOver={(e) => { e.target.style.background = "var(--primary-gradient)"; e.target.style.color = "white"; e.target.style.borderColor = "transparent"; }}
              onMouseOut={(e) => { e.target.style.background = "rgba(255,255,255,0.03)"; e.target.style.color = "var(--text-secondary)"; e.target.style.borderColor = "var(--border-ice)"; }}
            >
              {promptText}
            </span>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", gap: "10px", background: "var(--bg-card)" }}>
          <input
            type="text"
            placeholder="Ask AI about DP state transitions, complexity analyses, or ask for a study hint..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading} style={{ width: "42px", height: "42px", padding: "0" }}>
            <Send size={18} />
          </button>
        </div>

      </div>

      {/* 2. Right Split Code Editor Drawer Panel */}
      {editorOpen && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-card)", borderLeft: "1px solid var(--border-ice)", overflowY: "auto", padding: "1.5rem", gap: "1.25rem", animation: "slideIn 0.25s ease-out" }} className="mentor-code-drawer">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Code2 size={16} style={{ color: "var(--primary-light)" }} />
              <h3 style={{ fontSize: "1rem" }}>Paste Code for Review</h3>
            </div>
            <button className="db-logout-btn" style={{ padding: "0.25rem" }} onClick={() => setEditorOpen(false)}>
              <PanelRightClose size={16} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Language</span>
            <select
              value={editorLang}
              onChange={(e) => setEditorLang(e.target.value)}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", height: "30px", width: "120px" }}
            >
              <option value="cpp">C++ 20</option>
              <option value="python">Python 3.10</option>
              <option value="java">Java 17</option>
              <option value="javascript">JavaScript ES6</option>
            </select>
          </div>

          {/* Interactive Mock Code Editor */}
          <textarea
            className="code-editor-mock"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <button
            className="btn btn-primary"
            style={{ width: "100%", height: "40px" }}
            onClick={handleCodeReview}
            disabled={evaluating}
          >
            <Cpu size={16} />
            <span>{evaluating ? "Evaluating Complexity..." : "Run AI Review"}</span>
          </button>

          {/* Complexity analysis logs */}
          {analysisResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem", animation: "fadeIn 0.3s ease" }}>
              
              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-danger)", fontWeight: "700", textTransform: "uppercase" }}>Complexity Diagnostic</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "6px 0" }}>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", display: "block" }}>Time Complexity</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "white" }}>{analysisResult.timeComplexity}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", display: "block" }}>Space Complexity</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", fontFamily: "var(--font-mono)", color: "white" }}>{analysisResult.spaceComplexity}</span>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-warning)", display: "block", marginTop: "4px" }}>
                  Verdict: <b>{analysisResult.optimality}</b>
                </span>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: "1.4" }}>
                  {analysisResult.verdict}
                </p>
              </div>

              <div style={{ padding: "1rem", borderRadius: "10px", background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-success)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Optimized Solution Hint</span>
                
                {/* Prefilled Code block */}
                <pre style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  padding: "0.6rem",
                  borderRadius: "6px",
                  background: "#080b11",
                  color: "#34d399",
                  overflowX: "auto",
                  border: "1px solid rgba(255,255,255,0.03)",
                  lineHeight: "1.4"
                }}>
                  {analysisResult.optimizedCode}
                </pre>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: "1.4" }}>
                  {analysisResult.suggestion}
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Slide & Fade Keyframe animations inside page */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 900px) {
          .mentor-layout {
            grid-template-columns: 1fr !important;
            height: calc(100vh - 100px) !important;
          }
          .mentor-code-drawer {
            position: fixed;
            top: 70px;
            right: 0;
            bottom: 0;
            width: 320px !important;
            z-index: 130;
            box-shadow: var(--shadow-lg);
          }
        }
      `}</style>

    </div>
  );
}

function Mentor() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MentorContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Mentor;
