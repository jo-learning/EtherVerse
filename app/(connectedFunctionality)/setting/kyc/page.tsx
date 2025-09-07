"use client";
import { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";

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
      <h1 className="text-2xl font-bold mb-4" style={{ color: COLORS.neonGreen }}>KYC Verification</h1>
      <p className="mb-6" style={{ color: COLORS.textGray }}>
        Upload your documents and verify your identity to enable full dApp features.
      </p>
      {kycData ? (
        <div className="max-w-md mx-auto rounded-xl shadow p-6 space-y-4" style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.neonGreen }}>KYC Information</h2>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>Country:</span> {kycData.country}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>First Name:</span> {kycData.firstName}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>Last Name:</span> {kycData.lastName}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>Certificate Type:</span> {kycData.certificateType}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>Certificate Number:</span> {kycData.certificateNumber}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>ID Phone:</span> {kycData.idPhone}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>ID Front:</span> {kycData.idFront}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>ID Back:</span> {kycData.idBack}</div>
          <div><span className="font-medium" style={{ color: COLORS.neonGreen }}>Hand-held ID:</span> {kycData.handHeld}</div>
          <div className="mt-4 font-bold" style={{ color: COLORS.neonGreen }}>KYC Status: Approved!</div>
        </div>
      ) : (
        <form
          className="max-w-md mx-auto rounded-xl shadow p-6 space-y-4"
          style={{ background: COLORS.navy, color: COLORS.textWhite, border: `1px solid ${COLORS.purple}` }}
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>Country</label>
            <select
              required
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full p-2 rounded-lg"
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
              {/* ... */}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full p-2 rounded-lg"
              style={{
                border: `1px solid ${COLORS.purple}`,
                background: COLORS.background,
                color: COLORS.textWhite,
              }}
            />
          </div>
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full p-2 rounded-lg"
              style={{
                border: `1px solid ${COLORS.purple}`,
                background: COLORS.background,
                color: COLORS.textWhite,
              }}
            />
          </div>
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>Certificate Type</label>
            <select
              required
              value={certificateType}
              onChange={e => setCertificateType(e.target.value)}
              className="w-full p-2 rounded-lg"
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
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>Certificate Number</label>
            <input
              type="text"
              required
              value={certificateNumber}
              onChange={e => setCertificateNumber(e.target.value)}
              className="w-full p-2 rounded-lg"
              style={{
                border: `1px solid ${COLORS.purple}`,
                background: COLORS.background,
                color: COLORS.textWhite,
              }}
            />
          </div>
          <div>
            <label className="block font-medium mb-1" style={{ color: COLORS.textWhite }}>ID Phone</label>
            <input
              type="text"
              required
              value={idPhone}
              onChange={e => setIdPhone(e.target.value)}
              className="w-full p-2 rounded-lg"
              style={{
                border: `1px solid ${COLORS.purple}`,
                background: COLORS.background,
                color: COLORS.textWhite,
              }}
            />
          </div>
          {/* Image Uploaders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1" style={{ color: COLORS.neonGreen }}>Photo of the ID (Front)</label>
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
                    style={{
                      border: `1px solid ${COLORS.purple}`,
                      background: COLORS.background,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: COLORS.neonGreen }}>Photo of the ID (Back)</label>
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
                    style={{
                      border: `1px solid ${COLORS.purple}`,
                      background: COLORS.background,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1" style={{ color: COLORS.neonGreen }}>Photo of your hand-held ID</label>
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
                    style={{
                      border: `1px solid ${COLORS.purple}`,
                      background: COLORS.background,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-bold transition"
            style={{
              background: COLORS.purple,
              color: COLORS.neonGreen,
              border: `1px solid ${COLORS.neonGreen}`,
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
            Submit KYC
          </button>
        </form>
      )}
      {/* Status */}
      {status === "pending" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl shadow text-center flex flex-col items-center"
          style={{ background: COLORS.navy, color: COLORS.neonGreen, border: `1px solid ${COLORS.purple}` }}>
          <span className="font-bold mb-2">KYC Status: Pending...</span>
          <div className="w-8 h-8 border-4" style={{
            borderColor: COLORS.purple,
            borderTopColor: "transparent",
            borderRadius: "9999px",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      )}
      {status === "rejected" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl shadow text-center"
          style={{ background: COLORS.navy, color: "#ff1744", border: `1px solid ${COLORS.purple}` }}>
          <span className="font-bold">KYC Status: Rejected</span>
        </div>
      )}
    </div>
  );
}
