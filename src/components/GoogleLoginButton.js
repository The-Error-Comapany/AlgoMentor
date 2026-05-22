"use client";

import { useEffect } from "react";
import { googleLogin } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function GoogleLoginButton({ width = 376 }) {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await googleLogin(response.credential);
            if (res.success && res.accessToken) {
              login(res.accessToken);
              router.push("/dashboard");
            } else {
              alert(res.message || "Google login failed. Try another method.");
            }
          } catch (err) {
            alert(
              err.response?.data?.message ||
              "Google login failed. Try another method."
            );
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
          theme: "outline",
          size: "large",
          width: width,
        }
      );
    };

    // Poll for window.google availability to prevent script loading race conditions
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google) {
        clearInterval(interval);
        initGoogle();
      } else if (attempts >= 50) { // 5s max wait time
        clearInterval(interval);
        console.error("Google platform script load timeout.");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [login, router, width]);

  return <div id="google-btn" style={{ minHeight: "44px", width: "100%", display: "flex", justifyContent: "center" }}></div>;
}

export default GoogleLoginButton;
