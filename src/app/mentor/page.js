"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Brain,
  Send,
  Trash2,
  User,
  Clock,
  Sparkles,
  Code2,
  Cpu,
  ChevronRight
} from "lucide-react";

function MentorContent() {
  const searchParams = useSearchParams();
  const initProblem = searchParams.get("problem");
  const initPlatform = searchParams.get("platform");

  // Dynamic user name state
  const [userName, setUserName] = useState("Aishvary");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  // Conversation state
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey there! I've loaded your DSA metrics. I see you've mastered **Arrays & Hashing (92%)** but could use some work on **Dynamic Programming (30%)** and **Recursion State Transitions**.\n\nHow can I help you sharpen your skills today? I can suggest problems, explain algorithms, or review your code!",
      time: "11:15 AM"
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Left Panel collapsible Code Reviewer state
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [codeToReview, setCodeToReview] = useState(
`int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`
  );

  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load problem context from URL query params
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
          text: `I've loaded the details for **"${initProblem}"**. It's classified as a **Hard** sliding window challenge.\n\nHere is a conceptual hint to get you started:\n1. Maintain a double-ended queue (deque) of indices representing elements within the window.\n2. Ensure the deque stores elements in a decreasing order of their values.\n3. Try writing down your code, paste it using the **Review my code** panel on the left, and let me review its complexity!`,
          time: "11:16 AM"
        }
      ]);
      setShowCodeBox(true);
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
        aiResponseText = "Based on your current dashboard diagnostics, you should focus on **Sliding Window Problems** first to bridge the gap between Arrays and DP. Try practicing *'Sliding Window Maximum'* or *'Longest Substring Without Repeating Characters'*. I've highlighted these in your library!";
      } else if (textLower.includes("dynamic programming") || textLower.includes("dp")) {
        aiResponseText = "Dynamic Programming (DP) is just recursion with state memoization! Since your strength is Arrays, you can think of DP as filling up a 1D or 2D array representing subproblems. Let's start with *'Climbing Stairs'* (1D array) then move to *'Unique Paths'* (2D array).";
      } else if (textLower.includes("recursion") || textLower.includes("base case")) {
        aiResponseText = "Recursion requires two key elements:\n1. The **base case** (terminating condition to prevent stack overflow).\n2. The **relation step** (how to divide the subproblem).\n\nIf you have recursive code ready, paste it in the **Review my code** editor box on the left, and I'll trace its stack frame and runtime complexity.";
      } else {
        aiResponseText = "That's an interesting approach! Make sure you evaluate your recursion base cases. If you want me to analyze the exact time and space complexity of your algorithm, paste your code in the **Review my code** editor panel on the left and let's run an optimization trace.";
      }

      const aiMsg = { sender: "ai", text: aiResponseText, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  const submitCodeReview = () => {
    if (!codeToReview.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const userMsg = { 
      sender: "user", 
      text: `Please review the complexity of this code:\n\n\`\`\`cpp\n${codeToReview}\n\`\`\``, 
      time: timeStr 
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulated Code Complexity Evaluation
    setTimeout(() => {
      const aiResponseText = `I've analyzed your submitted code! Here is the complexity and optimization breakdown:\n\n` +
        `• **Time Complexity:** O(2^N) — Exponential recursion due to independent fib(n-1) and fib(n-2) branches.\n` +
        `• **Space Complexity:** O(N) — Recursion stack depth.\n` +
        `• **Verdict:** Sub-Optimal (highly redundant calculations).\n\n` +
        `**Optimized Solution Hint:**\n` +
        `\`\`\`cpp\n` +
        `int memo[1000] = {0};\n` +
        `int fib(int n) {\n` +
        `    if (n <= 1) return n;\n` +
        `    if (memo[n] != 0) return memo[n];\n` +
        `    return memo[n] = fib(n - 1) + fib(n - 2);\n` +
        `}\n` +
        `\`\`\`\n` +
        `By introducing a memoization array, you capture repeating states and reduce the time complexity from **exponential O(2^N)** to **linear O(N)**!`;

      const aiMsg = { sender: "ai", text: aiResponseText, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1500);
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
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", height: "calc(100vh - 130px)" }} className="mentor-grid-layout">
      
      {/* 1. Left Panel: Presets & History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%", overflowY: "auto" }}>
        
        {/* Presets Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1.25rem" }}>
          <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} style={{ color: "var(--text-warning)" }} />
            Quick Presets
          </h4>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleSend("What should I study next?")}
            style={{ width: "100%", justifyContent: "flex-start", fontSize: "0.8rem", textAlign: "left", padding: "0.5rem 0.75rem" }}
          >
            <span>What should I study next? 🚀</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setShowCodeBox(!showCodeBox)}
            style={{ 
              width: "100%", 
              justifyContent: "flex-start", 
              fontSize: "0.8rem", 
              textAlign: "left", 
              padding: "0.5rem 0.75rem",
              background: showCodeBox ? "rgba(99,102,241,0.1)" : "none",
              borderColor: showCodeBox ? "rgba(99,102,241,0.3)" : "var(--border-ice)"
            }}
          >
            <span>Review my code 💻</span>
          </button>

          {/* Plain Collapsible Code Review Box */}
          {showCodeBox && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px", animation: "slideIn 0.2s ease-out" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Paste code below to check complexity:</span>
              <textarea
                value={codeToReview}
                onChange={(e) => setCodeToReview(e.target.value)}
                placeholder="// Write code here"
                style={{
                  height: "120px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  background: "rgba(8,11,17,0.6)",
                  border: "1px solid var(--border-ice)",
                  borderRadius: "8px",
                  padding: "8px",
                  color: "#34d399",
                  resize: "none",
                  outline: "none"
                }}
              />
              <button 
                className="btn btn-primary btn-sm" 
                onClick={submitCodeReview} 
                style={{ width: "100%", fontSize: "0.75rem", padding: "0.45rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <Cpu size={12} />
                <span>Submit Code for Review</span>
              </button>
            </div>
          )}

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleSend("Explain Dynamic Programming state transitions")}
            style={{ width: "100%", justifyContent: "flex-start", fontSize: "0.8rem", textAlign: "left", padding: "0.5rem 0.75rem" }}
          >
            <span>DP Transitions Help 🧠</span>
          </button>
        </div>

        {/* Mock Past Sessions Timeline Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1.25rem", flexGrow: "1" }}>
          <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} style={{ color: "var(--primary-light)" }} />
            Past Chat Sessions
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { title: "Sliding Window Max", date: "May 21" },
              { title: "DP Memoization Guide", date: "May 18" },
              { title: "C++ Vector Optimization", date: "May 12" }
            ].map((session, i) => (
              <div 
                key={i} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "0.6rem 0.75rem", 
                  borderRadius: "8px", 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px solid var(--border-ice)",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>{session.title}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{session.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. Right Panel: Bubble Conversation Chat Area */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        background: "var(--bg-darker)", 
        borderRadius: "16px", 
        border: "1px solid var(--border-ice)", 
        overflow: "hidden"
      }}>
        
        {/* Chat Feed Header */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-ice)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Brain size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.95rem", margin: "0", color: "white", fontWeight: "600" }}>Algo Mentor AI</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "var(--text-success)" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
                <span>Context Ready: Arrays 92% | DP 30%</span>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={clearChat} title="Clear conversation logs">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Message Bubble Stream */}
        <div style={{ flexGrow: "1", padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {messages.map((m, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
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
                flexShrink: "0",
                boxShadow: "0 0 10px rgba(99, 102, 241, 0.2)"
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
                  backgroundColor: m.sender === "user" ? "rgba(99, 102, 241, 0.2)" : "var(--bg-card)",
                  color: "white",
                  border: m.sender === "user" ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border-ice)",
                  borderTopLeftRadius: m.sender === "user" ? "14px" : "0",
                  borderTopRightRadius: m.sender === "user" ? "0" : "14px",
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

        {/* Input Bar */}
        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-ice)", display: "flex", gap: "10px", background: "var(--bg-card)" }}>
          <input
            type="text"
            placeholder="Ask AI about DP transitions, complexity traces, or problem concepts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            style={{ flexGrow: "1" }}
          />
          <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading} style={{ width: "42px", height: "42px", padding: "0" }}>
            <Send size={18} />
          </button>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mentor-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
