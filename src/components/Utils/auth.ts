// utils/auth.ts
import { signOut } from "next-auth/react";

export const handleLogout = async () => {
  // Clear any app-specific storage
  localStorage.clear();
  sessionStorage.clear();

  // Sign out from NextAuth
  await signOut({
    redirect: false,
  });

  // Clear any cookies
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });

  // Redirect to login page
  window.location.href = "/login";
};
