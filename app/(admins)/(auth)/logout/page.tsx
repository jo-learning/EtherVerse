"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch (error) {
        console.error("Logout failed", error);
      } finally {
        router.push("/login");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging out...</p>
    </div>
  );
}
