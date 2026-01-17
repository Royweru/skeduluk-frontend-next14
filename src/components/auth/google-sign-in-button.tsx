"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api";

export function GoogleSignInButton({ 
  text = "signin_with" // 'signin_with' | 'signup_with' | 'continue_with'
}: { 
  text?: "signin_with" | "signup_with" | "continue_with" 
}) {
  const router = useRouter();
  // We access the store directly to set the user session without full page reload
  const setAuth = useAuthStore((state) => state.setAuth); 
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleGoogleResponse = async (response: any) => {
    try {
      // 1. Send the Google ID Token to your Backend
      const data = await authApi.googleLogin(response.credential);
      
      // 2. Save the session (Token + User Data)
      setAuth(data.user, data.access_token);
      
      // 3. Success & Redirect
      toast.success("Successfully signed in with Google!");
      router.push("/dashboard/overview");
      
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.detail || "Google sign in failed");
    }
  };

  useEffect(() => {
    // 1. Load the Google Script dynamically if not present
    const scriptId = "google-identity-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    // 2. Render the Button once script is ready
    // @ts-ignore
    if (isScriptLoaded && window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        // Remove 'auto_select' to prevent annoying popups on every reload
        auto_select: false 
      });

      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtnContainer"),
        { 
          theme: "outline", 
          size: "large", 
          width: "100%", // Responsive width
          text: text,
          logo_alignment: "left"
        }
      );
    }
  }, [isScriptLoaded, text]);

  return (
    <div className="w-full">
      {/* The Google Script will target this specific ID */}
      <div id="googleBtnContainer" className="w-full min-h-[40px]"></div>
    </div>
  );
}