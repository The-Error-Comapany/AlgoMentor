"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/services/authService";
import "./Signup.css";
import GoogleLoginButton from "@/components/GoogleLoginButton";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup({ name, email, password });

      // Move to verify OTP, passing email as query param
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.log("SIGNUP ERROR 👉", err.response);
      alert(
        err.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card signup-card">
        <h2 className="signup-title">Create Account</h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <hr style={{ margin: "1rem 0" }} />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLoginButton />
        </div>

        <p className="signup-footer">
          Already have an account?{" "}
          <span onClick={() => router.push("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
