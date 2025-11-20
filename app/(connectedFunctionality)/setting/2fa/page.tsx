"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";

type Message = { type: "success" | "error"; text: string } | null;
type ServerStatus = {
  enabled: boolean;
  pending: boolean;
  hasSecret: boolean;
  verifiedAt: string | null;
};

const CODE_LENGTH = 6;

const COLORS = {
  purple: "#4b0082",
  neonGreen: "#39FF14",
  background: "#0a1026",
  navy: "#172042",
  white: "#ffffff",
  textSubtle: "#b0b8c1",
};

export default function Google2FAPage() {
  const { address } = useAccount();
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [qrData, setQrData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string } | null>(null);
  const [codes, setCodes] = useState(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [localAuthenticated, setLocalAuthenticated] = useState(false);
  const identifier = address?.toLowerCase() ?? null;
  const localStorageKey = useMemo(() => (identifier ? `googlefa:${identifier}` : null), [identifier]);

  useEffect(() => {
    if (!identifier || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(localStorageKey!);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalAuthenticated(Boolean(parsed?.authenticated));
      } catch {
        setLocalAuthenticated(stored === "true");
      }
    } else {
      setLocalAuthenticated(false);
    }
  }, [identifier, localStorageKey]);

  useEffect(() => {
    if (!identifier) {
      setServerStatus(null);
      setLoadingStatus(false);
      return;
    }

  let abort = false;
  const safeIdentifier = identifier;
    async function fetchStatus() {
      setLoadingStatus(true);
      try {
  const res = await fetch(`/api/2fa/status?identifier=${encodeURIComponent(safeIdentifier)}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = (await res.json()) as ServerStatus;
        if (!abort) {
          setServerStatus(data);
        }
      } catch (error) {
        console.error("Failed to load 2FA status", error);
        if (!abort) {
          setServerStatus({ enabled: false, pending: false, hasSecret: false, verifiedAt: null });
        }
      } finally {
        if (!abort) setLoadingStatus(false);
      }
    }

    fetchStatus();
    return () => {
      abort = true;
    };
  }, [identifier]);

  useEffect(() => {
    if (codes.some((c) => c)) return;
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [codes]);

  const resetCodes = () => setCodes(Array(CODE_LENGTH).fill(""));

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...codes];
    next[index] = value;
    setCodes(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH).split("");
    if (pasted.length === CODE_LENGTH) {
      setCodes(pasted);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
    }
  };

  const withIdentifierGuard = (fn: () => Promise<void>) => async () => {
    if (!identifier) {
      setMessage({ type: "error", text: "Connect your wallet to manage 2FA." });
      return;
    }
    await fn();
  };

  const startSetup = withIdentifierGuard(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/2fa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, label: `EtherVerse (${identifier})` }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to start 2FA setup");
      }

      const data = await res.json();
      setQrData(data);
      setServerStatus({ enabled: false, pending: true, hasSecret: true, verifiedAt: null });
      resetCodes();
      if (localStorageKey && typeof window !== "undefined") {
        window.localStorage.removeItem(localStorageKey);
        setLocalAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not generate QR code." });
    } finally {
      setLoading(false);
    }
  });

  const verifyCode = withIdentifierGuard(async () => {
    if (codes.some((c) => c === "")) {
      setMessage({ type: "error", text: "Please enter the 6-digit code." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const token = codes.join("");
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Verification failed");
      }

      setServerStatus({ enabled: true, pending: false, hasSecret: true, verifiedAt: new Date().toISOString() });
      setMessage({ type: "success", text: "Google Authenticator is now enabled." });
      setQrData(null);
      resetCodes();
      if (localStorageKey && typeof window !== "undefined") {
        window.localStorage.setItem(localStorageKey, JSON.stringify({ authenticated: true, timestamp: new Date().toISOString() }));
        setLocalAuthenticated(true);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Verification failed." });
    } finally {
      setLoading(false);
    }
  });

  const disable2FA = withIdentifierGuard(async () => {
    if (codes.some((c) => c === "")) {
      setMessage({ type: "error", text: "Enter the current 6-digit code to disable." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const token = codes.join("");
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to disable 2FA");
      }

      setServerStatus({ enabled: false, pending: false, hasSecret: true, verifiedAt: null });
      setMessage({ type: "success", text: "Google Authenticator has been disabled." });
      setQrData(null);
      resetCodes();
      if (localStorageKey && typeof window !== "undefined") {
        window.localStorage.removeItem(localStorageKey);
        setLocalAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to disable 2FA." });
    } finally {
      setLoading(false);
    }
  });

  const renderCodeInputs = (disabled = false) => (
    <div className="flex justify-center space-x-2">
      {codes.map((code, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={code}
          disabled={disabled || loading}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{
            border: `1px solid ${COLORS.purple}`,
            background: COLORS.background,
            color: COLORS.white,
            opacity: disabled ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  );

  const statusBadge = serverStatus?.enabled
    ? { text: localAuthenticated ? "Enabled on this device" : "Enabled", color: COLORS.neonGreen }
    : serverStatus?.pending
    ? { text: "Pending verification", color: "#fbbc04" }
    : { text: "Not configured", color: COLORS.textSubtle };

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.background }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.white }}>
              Google Authenticator 2FA
            </h1>
            <p className="text-sm" style={{ color: COLORS.textSubtle }}>
              Add a second layer of protection to your EtherVerse account.
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              background: `${statusBadge.color}20`,
              border: `1px solid ${statusBadge.color}`,
              color: statusBadge.color,
            }}
          >
            {statusBadge.text}
          </span>
        </div>

        {!identifier && (
          <div
            className="rounded-xl p-6"
            style={{ background: COLORS.navy, border: `1px solid ${COLORS.purple}`, color: COLORS.white }}
          >
            <h2 className="text-lg font-semibold mb-2">Connect your wallet</h2>
            <p className="text-sm" style={{ color: COLORS.textSubtle }}>
              Please connect your wallet before setting up Google Authenticator.
            </p>
          </div>
        )}

        {identifier && (
          <div
            className="rounded-xl p-6 space-y-5"
            style={{ background: COLORS.navy, border: `1px solid ${COLORS.purple}`, color: COLORS.white }}
          >
            {loadingStatus ? (
              <div className="text-center" style={{ color: COLORS.neonGreen }}>
                Checking current status...
              </div>
            ) : (
              <>
                {message && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm"
                    style={{
                      background: message.type === "success" ? "#1f3d2a" : "#461f24",
                      border: `1px solid ${message.type === "success" ? COLORS.neonGreen : "#ff1744"}`,
                      color: message.type === "success" ? COLORS.neonGreen : "#ff6b81",
                    }}
                  >
                    {message.text}
                  </div>
                )}

                {!serverStatus?.enabled && (
                  <div className="space-y-4 text-sm" style={{ color: COLORS.textSubtle }}>
                    <p>
                      1. Click <strong>Generate QR</strong> to create a secret key.
                      <br />2. Scan the QR code with Google Authenticator (or enter the secret manually).
                      <br />3. Enter the 6-digit code to verify.
                    </p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={startSetup}
                      className="w-full py-2 rounded-lg font-semibold transition"
                      style={{
                        background: COLORS.purple,
                        color: COLORS.white,
                        border: `1px solid ${COLORS.white}`,
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {serverStatus?.pending ? "Regenerate QR" : "Generate QR"}
                    </button>
                  </div>
                )}

                {(qrData || serverStatus?.pending) && (
                  <div className="space-y-4 text-center">
                    {qrData ? (
                      <img
                        src={qrData.qrCodeDataUrl}
                        alt="Google Authenticator QR"
                        className="mx-auto rounded-lg"
                        width={180}
                        height={180}
                      />
                    ) : (
                      <p style={{ color: COLORS.textSubtle }}>
                        QR code not available. Generate a new one to continue.
                      </p>
                    )}
                    {qrData && (
                      <div className="text-sm" style={{ color: COLORS.textSubtle }}>
                        Secret Key:
                        <span
                          className="ml-2 font-mono px-2 py-1 rounded"
                          style={{
                            background: COLORS.background,
                            border: `1px solid ${COLORS.purple}`,
                            color: COLORS.white,
                          }}
                        >
                          {qrData.secret}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {(serverStatus?.pending || serverStatus?.enabled) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2" style={{ color: COLORS.white }}>
                        Enter 6-digit code
                      </label>
                      {renderCodeInputs()}
                    </div>

                    {serverStatus?.pending ? (
                      <button
                        type="button"
                        onClick={verifyCode}
                        disabled={loading}
                        className="w-full py-2 rounded-lg font-semibold transition"
                        style={{
                          background: COLORS.purple,
                          color: COLORS.white,
                          border: `1px solid ${COLORS.white}`,
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        Verify code
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={disable2FA}
                          disabled={loading}
                          className="w-full py-2 rounded-lg font-semibold transition"
                          style={{
                            background: "#2c1a2a",
                            color: "#ff6b81",
                            border: `1px solid #ff6b81`,
                            opacity: loading ? 0.6 : 1,
                          }}
                        >
                          Disable 2FA
                        </button>
                        <button
                          type="button"
                          onClick={resetCodes}
                          disabled={loading}
                          className="w-full py-2 rounded-lg text-sm"
                          style={{
                            background: COLORS.background,
                            color: COLORS.textSubtle,
                            border: `1px solid ${COLORS.purple}`,
                          }}
                        >
                          Clear digits
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {serverStatus?.enabled && (
                  <div
                    className="rounded-lg p-4 text-sm"
                    style={{ background: "#1f3d2a", border: `1px solid ${COLORS.neonGreen}`, color: COLORS.neonGreen }}
                  >
                    <p className="font-semibold">2FA active</p>
                    <p>
                      Last verified: {serverStatus.verifiedAt ? new Date(serverStatus.verifiedAt).toLocaleString() : "recently"}
                    </p>
                    {!localAuthenticated && (
                      <p className="mt-2" style={{ color: COLORS.white }}>
                        You have 2FA enabled but haven&apos;t marked this device as authenticated yet. Enter the code
                        above to disable or to sync the local device flag.
                      </p>
                    )}
                  </div>
                )}

                {loading && (
                  <div className="text-center text-sm" style={{ color: COLORS.neonGreen }}>
                    Working on it...
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}