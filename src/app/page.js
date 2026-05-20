"use client";

import { useRouter } from "next/navigation";
import "./Landing.css";

function Landing() {
  const router = useRouter();

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">Welcome 👋</h1>
        <p className="landing-subtitle">
          Get started with your account
        </p>

        <div className="landing-actions">
          <button onClick={() => router.push("/login")}>
            Login
          </button>

          <button
            className="secondary"
            onClick={() => router.push("/signup")}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
