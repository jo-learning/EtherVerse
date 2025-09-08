"use client";
import { useState, useEffect, useRef } from "react";
import { FaPlus, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

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
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [kycData, setKycData] = useState<any>(null);

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
      setKycData(JSON.parse(stored));
      setStatus("approved");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate KYC processing
    setTimeout(() => {
      const data = {
        country,
        firstName,
        lastName,
        certificateType,
        certificateNumber,
        idPhone,
        idFront: idFront ? idFront.name : "",
        idBack: idBack ? idBack.name : "",
        handHeld: handHeld ? handHeld.name : "",
      };
      localStorage.setItem("kycData", JSON.stringify(data));
      setKycData(data);
      setStatus("approved");
    }, 2000);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.background }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: COLORS.neonGreen }}>KYC Verification</h1>
        <p className="mb-8 text-center" style={{ color: COLORS.textGray }}>
          Complete your Know Your Customer verification to access all platform features
        </p>
        
        {kycData ? (
          <div className="rounded-xl shadow-lg p-8 space-y-6" style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}>
            <div className="flex items-center justify-center mb-6">
              <FaCheckCircle size={32} className="mr-3" style={{ color: COLORS.neonGreen }} />
              <h2 className="text-2xl font-bold" style={{ color: COLORS.neonGreen }}>KYC Verified Successfully!</h2>
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
              <span className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>Your KYC status: Verified</span>
            </div>
          </div>
        ) : (
          <form
            className="rounded-xl shadow-lg p-8 space-y-6"
            style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}
            onSubmit={handleSubmit}
          >
            {/* Form fields with labels and inputs side by side */}
            <div className="space-y-6">
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>Country</label>
                <select
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                >
                  <option value="">Select Country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Brazil">Brazil</option>
                </select>
              </div>
              
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>Certificate Type</label>
                <select
                  required
                  value={certificateType}
                  onChange={e => setCertificateType(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                >
                  <option value="">Select Certificate Type</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Driver's License">Driver's License</option>
                </select>
              </div>
              
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                />
              </div>
              
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                />
              </div>
              
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>Certificate Number</label>
                <input
                  type="text"
                  required
                  value={certificateNumber}
                  onChange={e => setCertificateNumber(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                />
              </div>
              
              <div className="flex flex-row md:flex-row md:items-center gap-4">
                <label className="w-full md:w-1/3 font-medium text-lg" style={{ color: COLORS.neonGreen }}>ID Phone</label>
                <input
                  type="text"
                  required
                  value={idPhone}
                  onChange={e => setIdPhone(e.target.value)}
                  className="w-full md:w-2/3 p-3 rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    border: `1px solid ${COLORS.purple}`,
                    background: COLORS.background,
                    color: COLORS.textWhite,
                  }}
                />
              </div>
            </div>
            
            {/* Image Uploaders */}
            <div className="pt-4">
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: COLORS.neonGreen }}>Upload Required Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <label className="block font-medium mb-3 text-lg" style={{ color: COLORS.neonGreen }}>ID Front</label>
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
                    <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>Click to upload front of ID</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <label className="block font-medium mb-3 text-lg" style={{ color: COLORS.neonGreen }}>ID Back</label>
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
                    <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>Click to upload back of ID</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <label className="block font-medium mb-3 text-lg" style={{ color: COLORS.neonGreen }}>Hand-held ID</label>
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
                    <p className="mt-2 text-sm" style={{ color: COLORS.textGray }}>Click to upload hand-held ID</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 mt-6"
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
          </form>
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
      `}</style>
    </div>
  );
}