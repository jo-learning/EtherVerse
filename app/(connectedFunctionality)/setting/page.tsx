"use client";
import Link from "next/link";
import { FaShieldAlt, FaIdCard, FaEnvelope, FaBell, FaLanguage, FaTrash } from "react-icons/fa";

const settings = [
  { icon: <FaShieldAlt />, label: "Google 2FA", href: "/setting/2fa" },
  { icon: <FaIdCard />, label: "KYC Verification", href: "/setting/kyc" },
  // { icon: <FaEnvelope />, label: "Email", href: "/setting/email" },
  { icon: <FaBell />, label: "Notification", href: "/setting/notification" },
  { icon: <FaLanguage />, label: "Language", href: "/setting/language" },
  { icon: <FaTrash />, label: "Clean Cache", href: "/setting/cache" },
];

export default function SettingPage() {
  return (
    <div className="min-h-screen p-3" style={{ background: "#0a1026" }}>
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: "#ffffff" }}
      >
        Settings
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {settings.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 rounded-xl shadow p-6 transition"
            style={{
              background: "#172042",
              color: "#ffffff",
              border: "1px solid #4b0082",
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = "#4b0082";
              (e.currentTarget as HTMLElement).style.color = "#39FF14";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = "#172042";
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
            }}
          >
            <span
              className="text-2xl"
              style={{ color: "#ffffff" }}
            >
              {item.icon}
            </span>
            <span className="font-semibold text-lg" style={{ color: "#ffffff" }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
