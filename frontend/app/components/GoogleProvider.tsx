"use client";

import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  if (!mounted) return <>{children}</>;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
