"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import "./Login.css";
import GoogleLoginButton from "@/components/GoogleLoginButton";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginApi(form);

      // save token globally
      login(res.accessToken);

      router.push("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit}>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <hr style={{ margin: "1rem 0" }} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLoginButton />
        </div>

        <p className="login-footer">
          Forgot password?{" "}
          <span onClick={() => router.push("/forgot-password")}>
            Reset
          </span>
        </p>

        <p className="login-footer">
          Don’t have an account?{" "}
          <span onClick={() => router.push("/signup")}>
            Signup
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
