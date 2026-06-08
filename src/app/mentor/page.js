"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Brain,
  Send,
  User,
  Clock,
  Sparkles,
  Code2,
  Cpu,
  ChevronRight,
  Plus,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function MentorContent() {
  const searchParams = useSearchParams();
  const initProblem = searchParams.get("problem");
  const initPlatform = searchParams.get("platform");
  const initPrompt = searchParams.get("initialPrompt");
  const { user, accessToken } = useAuth();

  // Dynamic user name state
  const [userName, setUserName] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  const [userStats, setUserStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey there! I'm loading your DSA metrics...",
      time: "Just now"
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = user?._id;
      if (!userId) {
        setMessages([{
          sender: "ai",
          text: "Hey there! How can I help you sharpen your DSA skills today?",
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        }]);
        return;
      }
      try {
        const res = await fetch(`/api/user/stats?userId=${userId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setUserStats(data[0]);
          setMessages([
            {
              sender: "ai",
              text: `Hey there! I've loaded your DSA metrics. I see you've solved ${data[0].solved || 0} problems!\n\nHow can I help you sharpen your skills today? I can suggest problems, explain algorithms, or review your code!`,
              time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            }
          ]);
        } else {
          setMessages([{
            sender: "ai",
            text: "Hey there! How can I help you sharpen your DSA skills today?",
            time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    const fetchSessions = async () => {
      const userId = user?._id;
      if (!userId) return;
      try {
        const res = await fetch(`/api/mentor/sessions?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions);
          // Restore the last active session on refresh
          const savedSessionId = localStorage.getItem("mentorSessionId");
          if (savedSessionId) {
            const sessionRes = await fetch(`/api/mentor/sessions?userId=${userId}&sessionId=${savedSessionId}`);
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.session) {
              setMessages(sessionData.session.messages);
              setCurrentSessionId(savedSessionId);
              return; // Skip the stats greeting — session is restored
            }
          }
        }
      } catch (e) {}
    };

    if (user) {
      fetchSessions().then(() => {
        // fetchStats sets the greeting only if no session was restored
        if (!localStorage.getItem("mentorSessionId")) {
          fetchStats();
        }
      });
    }
  }, [user]);

  // Persist current session ID so it survives a refresh
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("mentorSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  const loadSession = async (sessionId) => {
    const userId = user?._id;
    try {
      const res = await fetch(`/api/mentor/sessions?userId=${userId}&sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.session.messages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {}
  };
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill input if initialPrompt is provided in URL
  useEffect(() => {
    if (initPrompt) {
      setInput(initPrompt);
    }
  }, [initPrompt]);

  // Left Panel Code Reviewer state
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
    }
  }, [initProblem, initPlatform]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const userMsg = { sender: "user", text: textToSend, time: timeStr };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    try {
      const history = currentMessages.map(m => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.text
      }));
      const userId = user?._id;

      let newSessionId = currentSessionId;
      try {
        const saveRes = await fetch("/api/mentor/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
          userId, 
          sessionId: currentSessionId, 
          // Filter out any messages with empty time (initial loading placeholder)
          messages: currentMessages.filter(m => m.time && m.time.trim()), 
          title: textToSend.substring(0, 30) + "..." 
        })
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          newSessionId = saveData.sessionId;
          setCurrentSessionId(newSessionId);
          // Instantly update the Left Panel
          setSessions(prev => {
            const exists = prev.find(s => s._id === newSessionId);
            if (exists) {
              return prev.map(s => s._id === newSessionId ? { ...s, lastUpdated: new Date().toISOString() } : s).sort((a,b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            } else {
              return [{ _id: newSessionId, title: textToSend.substring(0, 30) + "...", lastUpdated: new Date().toISOString() }, ...prev];
            }
          });
        }
      } catch (e) {
        console.error("Failed to save session:", e);
      }

      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history, mode: "chat", userId: user?._id })
      });
      const data = await res.json();
      const aiMsg = {
        sender: "ai",
        text: data.success ? data.reply : "Sorry, I ran into an issue. Please try again!",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      };
      const finalMsgs = [...currentMessages, aiMsg];
      setMessages(finalMsgs);

      try {
        await fetch("/api/mentor/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
          userId, 
          sessionId: newSessionId, 
          messages: finalMsgs.filter(m => m.time && m.time.trim()) 
        })
        });
      } catch (e) {}

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Network error — couldn't reach the AI service. Please check your connection!", time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitCodeReview = async () => {
    if (!codeToReview.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const userMsg = { 
      sender: "user", 
      text: `Please review the complexity of this code:\n\n\`\`\`\n${codeToReview}\n\`\`\``, 
      time: timeStr 
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Please review this code", code: codeToReview, mode: "review", userId: user?._id })
      });
      const data = await res.json();
      const aiMsg = {
        sender: "ai",
        text: data.success ? data.reply : "Sorry, the AI code review failed. Please check that the AI service is running!",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Network error — couldn't reach the AI service. Please check your connection!", time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation(); // don't trigger loadSession
    if (!confirm("Delete this chat session?")) return;
    try {
      await fetch(`/api/mentor/sessions?sessionId=${sessionId}&userId=${user?._id}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (currentSessionId === sessionId) {
        clearChat();
      }
    } catch (err) {}
  };

  const clearChat = () => {
    setCurrentSessionId(null);
    localStorage.removeItem("mentorSessionId");
    setMessages([
      {
        sender: "ai",
        text: "Started a new coaching session! What should we solve next?",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      }
    ]);
  };


  const addToRevisionHub = async (title) => {
    const token = accessToken;
    if (!token) {
      alert("You must be logged in to add problems to the Revision Hub.");
      return;
    }
    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          platform: "LeetCode",
          url: "https://leetcode.com/problems/" + title.toLowerCase().replace(/\s+/g, '-') + "/",
          difficulty: "Medium",
          source: "library",
          confidence: 3,
          correctness: false,
          timeTaken: 0,
          hintsUsed: 0,
          submissionCount: 0
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ Added '${title}' to your Revision Hub!`);
      } else {
        alert(`❌ Could not add: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      alert(`❌ Network error: ${err.message}`);
    }
  };

  const MarkdownComponents = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    p({ children }) {
      // Find strings that have [PROBLEM: X]
      let newChildren = [];
      React.Children.forEach(children, (child, index) => {
        if (typeof child === 'string' && child.includes('[PROBLEM:')) {
          const parts = child.split(/\[PROBLEM:(.*?)\]/g);
          parts.forEach((part, i) => {
            if (i % 2 === 1) {
              newChildren.push(<button key={`btn-${index}-${i}`} onClick={() => addToRevisionHub(part.trim())} className="btn btn-primary btn-sm" style={{display:'inline-block', margin:'2px 4px', background:'linear-gradient(135deg, #8b5cf6, #ec4899)', border:'none', color:'white', fontSize:'0.7rem', padding:'2px 8px'}}>➕ Add '{part.trim()}'</button>);
            } else if (part) {
              newChildren.push(part);
            }
          });
        } else {
          newChildren.push(child);
        }
      });
      return <p>{newChildren}</p>;
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem", height: "calc(100vh - 130px)" }} className="mentor-grid-layout">
      
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
            onClick={() => handleSend("Based on my profile context and revision queue, what specific problem should I tackle next and why?")}
            style={{ width: "100%", justifyContent: "flex-start", fontSize: "0.8rem", textAlign: "left", padding: "0.5rem 0.75rem" }}
          >
            <span>Suggest next problem 🎯</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleSend("Look at my weakest topics and create a structured 3-day roadmap for me to improve.")}
            style={{ width: "100%", justifyContent: "flex-start", fontSize: "0.8rem", textAlign: "left", padding: "0.5rem 0.75rem" }}
          >
            <span>Create a 3-day roadmap 📈</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handleSend("Explain the core difference and trade-offs between Dynamic Programming and Greedy algorithms.")}
            style={{ width: "100%", justifyContent: "flex-start", fontSize: "0.8rem", textAlign: "left", padding: "0.5rem 0.75rem" }}
          >
            <span>DP vs Greedy Concepts 🧠</span>
          </button>
        </div>

        {/* Dedicated Code Review Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1.25rem", flexGrow: "1" }}>
          <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Code2 size={14} style={{ color: "#34d399" }} />
            Code Review
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: "1" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Paste code below to check complexity, edge cases, and optimizations:</span>
            <textarea
              value={codeToReview}
              onChange={(e) => setCodeToReview(e.target.value)}
              placeholder="// Write or paste your code here..."
              style={{
                height: "100%",
                minHeight: "350px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(52, 211, 153, 0.2)",
                borderRadius: "8px",
                padding: "12px",
                color: "#a7f3d0",
                resize: "vertical",
                outline: "none",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                lineHeight: "1.5"
              }}
            />
            <button 
              className="btn btn-primary btn-sm" 
              onClick={submitCodeReview} 
              disabled={loading}
              style={{ width: "100%", fontSize: "0.8rem", padding: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", color: "white" }}
            >
              <Cpu size={14} />
              <span style={{ fontWeight: "600" }}>Analyze Code Complexity</span>
            </button>
          </div>
        </div>

        {/* Persistent Past Sessions Timeline Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1.25rem", flexGrow: "1" }}>
          <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} style={{ color: "var(--primary-light)" }} />
            Past Chat Sessions
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sessions.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.6rem 0.75rem", textAlign: "center" }}>
                No past sessions found.
              </div>
            ) : (
              sessions.map((session) => (
                <div 
                  key={session._id} 
                  onClick={() => loadSession(session._id)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "0.5rem 0.6rem 0.5rem 0.75rem", 
                    borderRadius: "8px", 
                    background: currentSessionId === session._id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", 
                    border: currentSessionId === session._id ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border-ice)",
                    cursor: "pointer",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flex: 1 }}>
                    <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{new Date(session.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session._id)}
                    title="Delete session"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px 4px", borderRadius: "4px", flexShrink: 0, lineHeight: 1, opacity: 0.6 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                  >
                    <X size={12} style={{ color: "#f87171" }} />
                  </button>
                </div>
              ))
            )}
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
                <span>Context Ready: {userStats ? `Solved: ${userStats.solved || 0}` : "Loading stats..."}</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={clearChat}
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", padding: "0.4rem 0.85rem", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none" }}
          >
            <Plus size={13} />
            New Chat
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
                  borderTopRightRadius: m.sender === "user" ? "0" : "14px"
                }} className="markdown-body-override">
                  <ReactMarkdown components={MarkdownComponents}>{m.text}</ReactMarkdown>
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
        .markdown-body-override p {
          margin-bottom: 0.5rem;
          margin-top: 0;
        }
        .markdown-body-override p:last-child {
          margin-bottom: 0;
        }
        .markdown-body-override strong {
          font-weight: 700;
          color: #818cf8;
        }
        .markdown-body-override ul, .markdown-body-override ol {
          margin-top: 0;
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
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
