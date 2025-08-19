"use client";
import { useState, useEffect } from "react";

export default function KYCPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [kycData, setKycData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kycData");
    if (stored) {
      setKycData(JSON.parse(stored));
      setStatus("approved");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    // Simulate KYC processing
    setTimeout(() => {
      const data = {
        firstName,
        lastName,
        email,
        birthdate,
        fileName,
      };
      localStorage.setItem("kycData", JSON.stringify(data));
      setKycData(data);
      setStatus("approved");
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileName(f ? f.name : "");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">KYC Verification</h1>
      <p className="mb-6">Upload your documents and verify your identity to enable full dApp features.</p>
      {kycData ? (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2 text-purple-700 dark:text-purple-400">KYC Information</h2>
          <div><span className="font-medium">First Name:</span> {kycData.firstName}</div>
          <div><span className="font-medium">Last Name:</span> {kycData.lastName}</div>
          <div><span className="font-medium">Email:</span> {kycData.email}</div>
          <div><span className="font-medium">Birthdate:</span> {kycData.birthdate}</div>
          <div><span className="font-medium">profileImage:</span> {kycData.fileName}</div>
          <div className="mt-4 text-green-600 font-bold">KYC Status: Approved!</div>
        </div>
      ) : (
        <form className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Birthdate</label>
            <input
              type="date"
              required
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Upload Profile Image</label>
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
          >
            Submit KYC
          </button>
        </form>
      )}
      {/* Status */}
      {status === "pending" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-white dark:bg-gray-800 shadow text-center">
          <span className="text-yellow-500 font-bold">KYC Status: Pending...</span>
        </div>
      )}
      {status === "rejected" && (
        <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-white dark:bg-gray-800 shadow text-center">
          <span className="text-red-600 font-bold">KYC Status: Rejected</span>
        </div>
      )}
    </div>
  );
}
