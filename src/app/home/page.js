"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutApi } from "@/services/authService";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./Home.css";

function HomeContent() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi(); // clear refresh token cookie
    } catch (err) {
      console.error(err);
    } finally {
      logout(); // clear access token
      router.push("/");
    }
  };

  return (
    <div className="container">
      <div className="card home-card">
        <h2>Home</h2>
        <p>You are logged in 🎉</p>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

export default Home;
