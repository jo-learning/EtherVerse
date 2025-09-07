"use client";
import { useState } from "react";

export default function Google2FAPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"none" | "pending" | "verified" | "error">("none");
  // Simulated secret and QR code
  const secret = "JBSWY3DPEHPK3PXP";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/EtherVerse?secret=${secret}`;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate verification
    setTimeout(() => {
      if (code === "123456") setStatus("verified");
      else setStatus("error");
    }, 1000);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "#0a1026" }}>
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: "#39FF14" }}
      >
        Google 2FA Setup
      </h1>
      <div
        className="max-w-md mx-auto rounded-xl shadow p-6 space-y-6"
        style={{ background: "#172042", color: "#ffffff", border: "1px solid #4b0082" }}
      >
        <div className="flex flex-col items-center">
          <img src={qrUrl} alt="Google 2FA QR Code" className="mb-4 rounded-lg" />
          <div className="mb-2 text-center">
            <span className="font-semibold" style={{ color: "#39FF14" }}>Secret Key:</span>
            <span
              className="ml-2 font-mono px-2 py-1 rounded"
              style={{
                background: "#0a1026",
                color: "#39FF14",
                border: "1px solid #4b0082",
              }}
            >
              {secret}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "#b0b8c1" }}>
            Scan the QR code with Google Authenticator or enter the secret key manually.
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block font-medium mb-1" style={{ color: "#39FF14" }}>
            Enter 2FA Code
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full p-2 rounded-lg"
            style={{
              border: "1px solid #4b0082",
              background: "#0a1026",
              color: "#39FF14",
            }}
            placeholder="6-digit code"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-bold transition"
            style={{
              background: "#4b0082",
              color: "#39FF14",
              border: "1px solid #39FF14",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = "#39FF14";
              (e.currentTarget as HTMLElement).style.color = "#0D0D0D";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = "#4b0082";
              (e.currentTarget as HTMLElement).style.color = "#39FF14";
            }}
          >
            Verify
          </button>
        </form>
        {status === "pending" && (
          <div className="font-bold text-center" style={{ color: "#39FF14" }}>Verifying...</div>
        )}
        {status === "verified" && (
          <div className="font-bold text-center" style={{ color: "#39FF14" }}>2FA Verified!</div>
        )}
        {status === "error" && (
          <div className="font-bold text-center" style={{ color: "#ff1744" }}>Invalid code. Try again.</div>
        )}
      </div>
    </div>
  );
}
