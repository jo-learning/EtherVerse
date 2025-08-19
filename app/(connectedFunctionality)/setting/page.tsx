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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-8 text-purple-700 dark:text-purple-400">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {settings.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
          >
            <span className="text-2xl text-purple-600 dark:text-purple-400">{item.icon}</span>
            <span className="font-semibold text-lg">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
