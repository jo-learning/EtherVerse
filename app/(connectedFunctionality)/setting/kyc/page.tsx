"use client";
import { useState, useEffect, useRef } from "react";
import { FaPlus, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import CustomSelect from "@/components/CustomSelect";
import { useAccount } from "wagmi";
import { Toaster, toast } from "react-hot-toast";

// Color theme constants
const COLORS = {
  purple: "#4b0082",
  neonGreen: "#ffffff",
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042",
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

export default function KYCPage() {
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [idPhone, setIdPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [kycData, setKycData] = useState<any>(null);
   const { address } = useAccount();

  // Image states
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [handHeld, setHandHeld] = useState<File | null>(null);

  // Canvas refs
  const idFrontRef = useRef<HTMLCanvasElement>(null!);
  const idBackRef = useRef<HTMLCanvasElement>(null!);
  const handHeldRef = useRef<HTMLCanvasElement>(null!);

  // Draw image or icon to canvas
  const drawImageToCanvas = (file: File | null, canvasRef: React.RefObject<HTMLCanvasElement>) => {
   
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, 200, 120);
    if (file) {
      const img = new window.Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, 200, 120);
        ctx?.drawImage(img, 0, 0, 200, 120);
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Draw plus icon in center
      if (ctx) {
        ctx.save();
        ctx.strokeStyle = COLORS.neonGreen;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(100, 40);
        ctx.lineTo(100, 80);
        ctx.moveTo(80, 60);
        ctx.lineTo(120, 60);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  useEffect(() => { return drawImageToCanvas(idFront, idFrontRef); }, [idFront]);
  useEffect(() => { return drawImageToCanvas(idBack, idBackRef); }, [idBack]);
  useEffect(() => { return drawImageToCanvas(handHeld, handHeldRef); }, [handHeld]);

  useEffect(() => {
    const stored = localStorage.getItem("kycData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setKycData(parsed);
      setStatus(parsed.status || "pending");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");

    try {
      const fd = new FormData();
      fd.set("email", address || ""); // or set userId if you have it in session
      fd.set("country", country);
      fd.set("firstName", firstName);
      fd.set("lastName", lastName);
      fd.set("certificateType", certificateType);
      fd.set("certificateNumber", certificateNumber);
      fd.set("idPhone", idPhone);
      if (idFront) fd.set("idFront", idFront);
      if (idBack) fd.set("idBack", idBack);
      if (handHeld) fd.set("handHeld", handHeld);

      const res = await fetch("/api/kyc", { method: "POST", body: fd });
      const data = await res.json();

      if (res.status === 201) {
        const stored = {
          country, firstName, lastName, certificateType, certificateNumber, idPhone, email,
          status: "pending",
        };
        localStorage.setItem("kycData", JSON.stringify(stored));
        setKycData(stored);
        setStatus("pending");
      } else {
        setStatus("rejected");
        // alert(data?.error || "KYC submit failed");
        toast.error(data?.error || "KYC submit failed");
      }
    } catch (err) {
      setStatus("rejected");
      // alert("KYC submit failed");
      toast.error("KYC submit failed")
    }
  };

  // Optional polling to reflect approval changes
  useEffect(() => {
    if (!address) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/kyc/${address}`, { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        if (j?.status && j.status !== status) {
          setStatus(j.status);
          setKycData((prev: any) => {
            const stored = { ...(prev || {}), status: j.status };
            localStorage.setItem("kycData", JSON.stringify(stored));
            return stored;
          });
        }
      } catch {}
    }, 10000);
    return () => clearInterval(id);
  }, [status, address]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.background }}>
      <Toaster
              position="top-right"
              toastOptions={{
                style: { background: "#1f2937", color: "#fff", border: "1px solid #4b0082" },
                success: { iconTheme: { primary: "#22c55e", secondary: "#1f2937" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#1f2937" } },
              }}
            />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: COLORS.neonGreen }}>KYC Verification</h1>
        <p className="mb-8 text-center" style={{ color: COLORS.textGray }}>
          Complete your Know Your Customer verification to access all platform features
        </p>
        
        {kycData ? (
          status === "pending" ? (
            <div></div>
          ) : (
            <div className="rounded-xl shadow-lg p-8 space-y-6" style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}>
            <div className="flex items-center justify-center mb-6">
              <FaCheckCircle size={32} className="mr-3" style={{ color: COLORS.neonGreen }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.neonGreen }}> {status === "rejected" ? <span>KYC Rejected</span> : <span>KYC Verified Successfully!</span>}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>Country:</span>
                  <span>{kycData.country}</span>
                </div>
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>First Name:</span>
                  <span>{kycData.firstName}</span>
                </div>
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>Last Name:</span>
                  <span>{kycData.lastName}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>Certificate Type:</span>
                  <span>{kycData.certificateType}</span>
                </div>
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>Certificate Number:</span>
                  <span>{kycData.certificateNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2" style={{ borderColor: COLORS.purple }}>
                  <span className="font-medium" style={{ color: COLORS.neonGreen }}>ID Phone:</span>
                  <span>{kycData.idPhone}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-lg text-center" style={{ background: COLORS.background }}>
              <span className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>Your KYC status: {status === "rejected" ? <span className="text-red-500">Rejected</span> : <span className="text-green-500">Verified</span>}</span>
            </div>
          </div>
          )
          
        ) : (
          <>
            {/* Personal Information Card */}
            <div className="rounded-xl shadow-lg p-8 mb-6" style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}>
              <h2 className="text-lg font-bold mb-6 text-center" style={{ color: COLORS.neonGreen }}>Personal Information</h2>
              
              <form onSubmit={handleSubmit} className="">
                <div className="">
                  {/* Country Select */}
                  <div >
                    <CustomSelect
                      value={country}
                      onChange={e => setCountry(typeof e === "string" ? e : e.target.value)}
                      options={[
                        { value: "United States", label: "United States" },
                        { value: "Canada", label: "Canada" },
                        { value: "United Kingdom", label: "United Kingdom" },
                        { value: "Australia", label: "Australia" },
                        { value: "Germany", label: "Germany" },
                        { value: "France", label: "France" },
                        { value: "India", label: "India" },
                        { value: "Japan", label: "Japan" },
                        { value: "China", label: "China" },
                        { value: "Brazil", label: "Brazil" },
                      ]}
                      placeholder="Select your country"
                      required
                    />
                  </div>

                  {/* Certificate Type Select */}
                  <div >
                    <CustomSelect
                      value={certificateType}
                      onChange={e => setCertificateType(typeof e === "string" ? e : e.target.value)}
                      options={[
                        { value: "Passport", label: "Passport" },
                        { value: "National ID", label: "National ID" },
                        { value: "Driver's License", label: "Driver's License" },
                      ]}
                      placeholder="Select certificate type"
                      required
                    />
                  </div>

                  {/* First and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 pl-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-2 pt-2 pb-1 font-semibold focus:outline-none"
                        style={{
                          background: "transparent",
                          color: COLORS.textWhite,
                          border: "none",
                          borderBottom: `2.5px solid ${COLORS.purple}40`,
                          borderRadius: 0,
                          fontSize: "0.95rem",
                          transition: "border-color 0.3s",
                          minHeight: 40,
                        }}
                        onFocus={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}`)}
                        onBlur={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}40`)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-2 pt-2 pb-1 font-semibold focus:outline-none"
                        style={{
                          background: "transparent",
                          color: COLORS.textWhite,
                          border: "none",
                          borderBottom: `2.5px solid ${COLORS.purple}40`,
                          borderRadius: 0,
                          fontSize: "0.95rem",
                          transition: "border-color 0.3s",
                          minHeight: 40,
                        }}
                        onFocus={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}`)}
                        onBlur={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}40`)}
                      />
                    </div>
                  </div>

                  {/* Certificate Number */}
                  <div className="pb-4 pl-2">
                    <input
                      type="text"
                      required
                      value={certificateNumber}
                      onChange={e => setCertificateNumber(e.target.value)}
                      placeholder="Certificate number"
                      className="w-full px-2 pt-2 pb-1 font-semibold focus:outline-none"
                      style={{
                        background: "transparent",
                        color: COLORS.textWhite,
                        border: "none",
                        borderBottom: `2.5px solid ${COLORS.purple}40`,
                        borderRadius: 0,
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s",
                        minHeight: 40,
                      }}
                      onFocus={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}`)}
                      onBlur={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}40`)}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="pl-2"> 
                    <input
                      type="text"
                      required
                      value={idPhone}
                      onChange={e => setIdPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-2 pt-2 pb-1 font-semibold focus:outline-none"
                      style={{
                        background: "transparent",
                        color: COLORS.textWhite,
                        border: "none",
                        borderBottom: `2.5px solid ${COLORS.purple}40`,
                        borderRadius: 0,
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s",
                        minHeight: 40,
                      }}
                      onFocus={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}`)}
                      onBlur={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}40`)}
                    />
                  </div>

                  {/* Email
                  <div className="pb-4 pl-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-2 pt-2 pb-1 font-semibold focus:outline-none"
                      style={{
                        background: "transparent",
                        color: COLORS.textWhite,
                        border: "none",
                        borderBottom: `2.5px solid ${COLORS.purple}40`,
                        borderRadius: 0,
                        fontSize: "0.95rem",
                        transition: "border-color 0.3s",
                        minHeight: 40,
                      }}
                      onFocus={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}`)}
                      onBlur={e => (e.currentTarget.style.borderBottom = `2.5px solid ${COLORS.purple}40`)}
                    />
                  </div> */}
                </div>
              </form>
            </div>
            
            {/* Photo Upload Card */}
            <div className="rounded-xl shadow-lg p-8 mb-6" style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}>
              <h2 className="text-lg font-bold mb-6 text-center" style={{ color: COLORS.neonGreen }}>Document Upload</h2>
              
              <div className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <label style={{ cursor: "pointer" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageChange(e, setIdFront)}
                          className="hidden"
                        />
                        <canvas
                          ref={idFrontRef}
                          width={200}
                          height={120}
                          className="transition-all hover:opacity-80"
                          style={{
                            border: `2px dashed ${COLORS.purple}`,
                            background: COLORS.background,
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      </label>
                      <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>ID Front</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <label style={{ cursor: "pointer" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageChange(e, setIdBack)}
                          className="hidden"
                        />
                        <canvas
                          ref={idBackRef}
                          width={200}
                          height={120}
                          className="transition-all hover:opacity-80"
                          style={{
                            border: `2px dashed ${COLORS.purple}`,
                            background: COLORS.background,
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      </label>
                      <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>ID Back</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <label style={{ cursor: "pointer" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageChange(e, setHandHeld)}
                          className="hidden"
                        />
                        <canvas
                          ref={handHeldRef}
                          width={200}
                          height={120}
                          className="transition-all hover:opacity-80"
                          style={{
                            border: `2px dashed ${COLORS.purple}`,
                            background: COLORS.background,
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      </label>
                      <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>Hand-held ID</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              style={{
                background: COLORS.purple,
                color: COLORS.neonGreen,
                border: `2px solid ${COLORS.neonGreen}`,
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background = COLORS.neonGreen;
                (e.currentTarget as HTMLElement).style.color = COLORS.black;
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background = COLORS.purple;
                (e.currentTarget as HTMLElement).style.color = COLORS.neonGreen;
              }}
            >
              Submit Verification
            </button>
          </>
        )}
        
        {/* Status Indicators */}
        {status === "pending" && (
          <div className="mt-8 p-6 rounded-xl shadow-lg text-center flex flex-col items-center"
            style={{ background: COLORS.navy, color: COLORS.neonGreen, border: `1px solid ${COLORS.purple}` }}>
            <FaClock size={40} className="mb-4 animate-pulse" />
            <span className="font-bold text-xl mb-2">KYC Verification In Progress</span>
            <p style={{ color: COLORS.textGray }}>Please wait while we verify your information...</p>
            <div className="w-12 h-12 border-4 mt-4" style={{
              borderColor: COLORS.purple,
              borderTopColor: "transparent",
              borderRadius: "9999px",
              animation: "spin 1s linear infinite"
            }}></div>
          </div>
        )}
        
        {status === "rejected" && (
          <div className="mt-8 p-6 rounded-xl shadow-lg text-center flex flex-col items-center"
            style={{ background: COLORS.navy, color: "#ff1744", border: `1px solid ${COLORS.purple}` }}>
            <FaTimesCircle size={40} className="mb-4" />
            <span className="font-bold text-xl">KYC Verification Failed</span>
            <p className="mt-2" style={{ color: COLORS.textGray }}>Please check your information and try again</p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Modern input styling */
        input::placeholder, select:invalid {
          color: #b0b8c1;
          opacity: 0.7;
        }
        
        input:focus::placeholder, select:focus:invalid {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}