"use client";
import Link from "next/link";
import { FaShieldAlt, FaIdCard, FaEnvelope, FaBell, FaLanguage, FaTrash, FaChevronRight } from "react-icons/fa";

const settings = [
  { icon: <FaShieldAlt />, label: "Google 2FA", href: "/setting/2fa" },
  { icon: <FaIdCard />, label: "KYC Verification", href: "/setting/kyc" },
  { icon: <FaBell />, label: "Notification", href: "/setting/notification" },
  { icon: <FaLanguage />, label: "Language", href: "/setting/language" },
  { icon: <FaTrash />, label: "Clean Cache", href: "/setting/cache" },
];

export default function SettingPage() {
  return (
    <div className="min-h-screen p-4" style={{ background: "#0a1026" }}>
      <div className="max-w-2xl mx-auto">
        {/* <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1> */}
        
        <div 
          className="rounded-xl overflow-hidden shadow-lg"
          style={{ 
            background: "#172042",
            border: "1px solid #4b0082"
          }}
        >
          {settings.map((item, index) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-6 py-4 transition-all group"
                style={{
                  color: "#ffffff",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = "#4b0082";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" style={{ color: "#39FF14" }}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex flex-row justify-center items-center text-gray">
                  {/* <span className="pr-1">Not set</span> */}
                {
                  item.label === "Google 2FA" && (
                    <span className="pr-1" style={{color: "gray"}}>Not set</span>
                  )
                }
                {
                  item.label === "KYC Verification" && (
                    <span className="pr-1" style={{color: "gray"}}>Not set</span>
                  )
                }
                <FaChevronRight 
                  className="text-sm opacity-70 group-hover:translate-x-1 transition-transform" 
                  style={{ color: "#39FF14" }}
                />
                </div>
              </Link>
              
              {/* Separator line - don't show after last item */}
              {index < settings.length - 1 && (
                <hr style={{ borderColor: "#4b0082", margin: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}