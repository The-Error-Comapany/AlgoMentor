"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function HomeContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 style={{ color: "var(--text-secondary)" }}>Redirecting to Dashboard...</h3>
      <div style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "pulse-glowing 1s infinite linear" }} />
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
