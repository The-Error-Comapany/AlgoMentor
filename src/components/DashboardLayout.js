"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutApi } from "@/services/authService";
import {
  LayoutDashboard,
  Code2,
  Calendar,
  Flame,
  MessageSquareCode,
  User,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Clock,
  Compass,
  History,
  CheckCircle,
  Brain
} from "lucide-react";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const { logout, user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [extConnected, setExtConnected] = useState(true);

  // Fetch notifications dynamically
  useEffect(() => {
    async function fetchNotificationsData() {
      if (!user?._id) return;
      
      try {
        const notifs = [];
        let idCounter = 1;
        
        // Fetch upcoming contests
        const contestsRes = await fetch("/api/contests");
        const ctType = contestsRes.headers.get("content-type");
        if (ctType && ctType.includes("application/json")) {
          const contestsData = await contestsRes.json();
          if (Array.isArray(contestsData)) {
            const now = new Date();
            // Keep contests until they end (startTime + duration in ms > now)
            const upcoming = contestsData.filter(c => {
               const durationMs = (c.duration || 0) * 1000;
               return new Date(c.startTime).getTime() + durationMs > now.getTime();
            }).slice(0, 3);
            
            upcoming.forEach(c => {
              const contestId = `contest_${c._id || c.slug || idCounter++}`;
              const isRead = user.readContests?.includes(contestId);
              notifs.push({
                id: contestId,
                type: 'contest',
                title: "Upcoming Contest",
                desc: `${c.name} on ${c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}.`,
                time: new Date(c.startTime).toLocaleString(),
                unread: !isRead,
                icon: <Calendar size={16} />
              });
            });
          }
        }
        
        // Fetch user stats for achievements
        const statsRes = await fetch(`/api/user/stats?userId=${user._id}`);
        const stType = statsRes.headers.get("content-type");
        if (stType && stType.includes("application/json")) {
          const statsData = await statsRes.json();
          if (Array.isArray(statsData)) {
            let totalSolved = 0;
            statsData.forEach(s => {
              totalSolved += (s.solved || 0);
            });
            
            if (totalSolved >= 100) {
              const milestone = Math.floor(totalSolved / 100) * 100;
              const milestoneId = `milestone_${milestone}`;
              if (!user.readAchievements?.includes(milestoneId)) {
                notifs.push({
                  id: milestoneId,
                  type: 'achievement',
                  title: "Achievement Unlocked! 🏆",
                  desc: `You crossed ${milestone} problems solved! Keep it up!`,
                  time: "Just now",
                  unread: true,
                  icon: <Brain size={16} />
                });
              }
            }
          }
        }
        
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to fetch notification data:", err);
      }
    }
    
    fetchNotificationsData();
  }, [user]);

  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        router.push("/problems");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout API failed, performing fallback logout", err);
    } finally {
      logout();
      router.push("/");
    }
  };

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard": return "Dashboard";
      case "/problems": return "Problem Library";
      case "/contests": return "Contest Calendar";
      case "/mentor": return "AI Mentor Chat";
      case "/profile": return "Analytics Profile";
      case "/settings": return "User Settings";
      case "/analysis": return "Extension Analysis History";
      default: return "Algo Mentor";
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Problems", path: "/problems", icon: <Code2 size={18} /> },
    { name: "Contests", path: "/contests", icon: <Calendar size={18} /> },
    { name: "Profile", path: "/profile", icon: <User size={18} /> },
    { name: "Mentor", path: "/mentor", icon: <MessageSquareCode size={18} /> },
    { name: "Analysis", path: "/analysis", icon: <History size={16} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={18} /> }
  ];

  const handleNavClick = (path) => {
    router.push(path);
    setSidebarOpen(false); // Close mobile menu drawer on click
  };

  const markAllRead = async () => {
    const unreadNotifs = notifications.filter(n => n.unread);
    if (unreadNotifs.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })).filter(n => n.type !== 'achievement'));

    try {
      const token = localStorage.getItem("accessToken");
      const currentReadAchievements = new Set(user?.readAchievements || []);
      const currentReadContests = new Set(user?.readContests || []);
      
      let hasChanges = false;
      
      unreadNotifs.forEach(n => {
        if (n.type === 'achievement') {
          if (!currentReadAchievements.has(n.id)) {
            currentReadAchievements.add(n.id);
            hasChanges = true;
          }
        } else if (n.type === 'contest') {
          if (!currentReadContests.has(n.id)) {
            currentReadContests.add(n.id);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        const payload = {};
        if (currentReadAchievements.size > 0) payload.readAchievements = Array.from(currentReadAchievements);
        if (currentReadContests.size > 0) payload.readContests = Array.from(currentReadContests);

        const res = await fetch("/api/auth/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const markAsRead = async (id, type) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n).filter(n => {
       if (n.id === id && n.type === 'achievement') return false; // Hide read achievements immediately
       return true;
    }));

    try {
      const token = localStorage.getItem("accessToken");
      const currentReadAchievements = user?.readAchievements || [];
      const currentReadContests = user?.readContests || [];
      
      const payload = {};
      if (type === "achievement") {
        if (!currentReadAchievements.includes(id)) {
          payload.readAchievements = [...currentReadAchievements, id];
        }
      } else if (type === "contest") {
        if (!currentReadContests.includes(id)) {
          payload.readContests = [...currentReadContests, id];
        }
      }

      if (Object.keys(payload).length > 0) {
        const res = await fetch("/api/auth/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="db-wrapper">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="db-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Sidebar */}
      <aside className={`db-sidebar ${sidebarOpen ? "db-sidebar-open" : ""}`}>
        <div className="db-sidebar-header">
          <div className="db-logo">
            <Brain size={20} />
          </div>
          <span className="db-brand-name">Algo Mentor</span>
          <button className="db-mobile-toggle" style={{ marginLeft: "auto" }} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="db-sidebar-nav">
          <span className="db-nav-section-title">Command Center</span>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`db-nav-item ${pathname === item.path ? "db-nav-item-active" : ""}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-info" onClick={() => handleNavClick("/profile")} style={{ cursor: "pointer" }}>
            <div className="db-user-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</div>
            <div className="db-user-details">
              <span className="db-user-name">{user?.name || "User"}</span>
              <span className="db-user-handle">
                {user?.lcHandle ? `@${user.lcHandle}` : user?.cfHandle ? `@${user.cfHandle}` : "@algo_mentor"}
              </span>
            </div>
          </div>
          <button className="db-logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <div className="db-header-left">
            <button className="db-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h2 className="db-page-title">{getPageTitle()}</h2>
          </div>

          <div className="db-header-right">
            {/* Mock Search Input */}
            <div className="db-search-mock">
              <Search className="db-search-icon" size={16} />
              <input
                className="db-search-input"
                type="text"
                placeholder="Search problems..."
                readOnly
                onClick={() => router.push("/problems")}
              />
              <span className="db-search-shortcut">Ctrl K</span>
            </div>


            {/* Notifications panel */}
            <div className="db-notification-container" ref={notifRef}>
              <button className="db-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="db-notification-badge">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="db-notif-dropdown">
                  <div className="db-notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button className="db-notif-clear" onClick={markAllRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="db-notif-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`db-notif-item ${n.unread ? "db-notif-item-unread" : ""}`}>
                          <div className="db-notif-icon">{n.icon}</div>
                          <div className="db-notif-content">
                            <span className="db-notif-title">{n.title}</span>
                            <span className="db-notif-desc">{n.desc}</span>
                            <span className="db-notif-time">{n.time}</span>
                          </div>
                          {n.unread && (
                            <button 
                               className="db-notif-read-btn" 
                               onClick={(e) => { e.stopPropagation(); markAsRead(n.id, n.type); }}
                               title="Mark as read"
                            >
                               <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="db-notif-footer">
                    <a href="/contests" className="db-notif-footer-link" onClick={(e) => { e.preventDefault(); setNotifOpen(false); router.push("/contests"); }}>
                      View Contest Calendar
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable page children content */}
        <main className="db-content-area">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
