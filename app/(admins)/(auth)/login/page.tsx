"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
  ok: boolean;
  token?: string;
  admin?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
  error?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Session check via GET (cookie based)
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch("/api/login", { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!abort && data.authenticated && data.admin) {
          router.replace("/dashboard");
        }
      } catch {}
    })();
    return () => { abort = true; };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Email and password required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok || !data.ok || !data.admin) {
        setErr(data.error || "Invalid credentials");
      } else {
        // Optional: store role (not token; token is HttpOnly cookie)
        try {
          localStorage.setItem("adminRole", data.admin.role);
        } catch {}
        router.replace("/dashboard");
      }
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0c0f17,#141b2e)"
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        maxWidth: 400,
        background: "#1f2738",
        padding: "2rem",
        borderRadius: 12,
        boxShadow: "0 8px 28px -6px rgba(0,0,0,0.5)",
        fontFamily: "system-ui, sans-serif",
        color: "#dbe2ef"
      }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 600, letterSpacing: ".5px" }}>
          Admin Login
        </h1>
        <p style={{ marginTop: 6, fontSize: ".8rem", opacity: .7 }}>
          Enter email and password
        </p>

        <label style={{ display: "block", marginTop: 18, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".5px", opacity: .75 }}>
          Email
        </label>
        <input
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@example.com"
          style={inputStyle}
          type="email"
          required
        />

        <label style={{ display: "block", marginTop: 18, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".5px", opacity: .75 }}>
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            autoComplete="current-password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd(s => !s)}
            style={{
              position: "absolute",
              right: 8,
              top: 6,
              background: "none",
              border: "none",
              color: "#9fb3c8",
              cursor: "pointer",
              fontSize: ".7rem"
            }}
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>

        {err && (
          <div style={{
            marginTop: 14,
            background: "#3a2030",
            color: "#ffb4c1",
            padding: "8px 10px",
            borderRadius: 6,
            fontSize: ".7rem"
          }}>{err}</div>
        )}

        <button
          disabled={loading}
          type="submit"
          style={{
            marginTop: 26,
            width: "100%",
            background: loading ? "#2c3a52" : "linear-gradient(90deg,#2563eb,#1d4ed8)",
            border: "none",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#fff",
            fontWeight: 600,
            letterSpacing: ".5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: ".85rem",
            boxShadow: "0 4px 14px -2px rgba(37,99,235,0.35)"
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: ".65rem", opacity: .45 }}>
          v1.0 secure panel
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#273248",
  color: "#dbe2ef",
  border: "1px solid #33405a",
  outline: "none",
  padding: "10px 12px",
  fontSize: ".8rem",
  borderRadius: 8,
  marginTop: 4,
  fontFamily: "inherit",
  transition: "border .2s"
};