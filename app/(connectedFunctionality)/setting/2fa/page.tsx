"use client";
import { useState, useRef, useEffect } from "react";

export default function Google2FAPage() {
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"none" | "pending" | "verified" | "error">("none");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Simulated secret and QR code
  const secret = "JBSWY3DPEHPK3PXP";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/EtherVerse?secret=${secret}`;

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits and limit to one character
    if (value && !/^\d$/.test(value)) return;
    
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    
    // Auto-focus next input if a digit was entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !codes[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length === 6) {
      const newCodes = [...codes];
      digits.forEach((digit, index) => {
        newCodes[index] = digit;
      });
      setCodes(newCodes);
      
      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = codes.join('');
    
    // Check if all digits are entered
    if (fullCode.length !== 6) {
      setStatus("error");
      return;
    }
    
    setStatus("pending");
    // Simulate verification
    setTimeout(() => {
      if (fullCode === "123456") setStatus("verified");
      else setStatus("error");
    }, 1000);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "#0a1026" }}>
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: "#ffffff" }}
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
            <span className="font-semibold" style={{ color: "#ffffff" }}>Secret Key:</span>
            <span
              className="ml-2 font-mono px-2 py-1 rounded"
              style={{
                background: "#0a1026",
                color: "#ffffff",
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
          <label className="block font-medium mb-1" style={{ color: "#ffffff" }}>
            Enter 6-digit code
          </label>
          
          <div className="flex justify-center space-x-2">
            {codes.map((code, index) => (
              <input
                key={index}
                // ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={code}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{
                  border: "1px solid #4b0082",
                  background: "#0a1026",
                  color: "#ffffff",
                }}
              />
            ))}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-bold transition"
            style={{
              background: "#4b0082",
              color: "#ffffff",
              border: "1px solid #ffffff",
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