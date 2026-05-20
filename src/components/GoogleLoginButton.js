"use client";

import { useEffect } from "react";
import { googleLogin } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function GoogleLoginButton() {
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
            login(res.accessToken);
            router.push("/home");
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
          width: 260,
        }
      );
    };

    // small delay ensures DOM ready
    setTimeout(initGoogle, 100);

  }, [login, router]);

  return <div id="google-btn"></div>;
}

export default GoogleLoginButton;
