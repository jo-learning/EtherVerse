"use client";
import "../globals.css";
import {
  FaChartLine,
  FaCogs,
  FaComments,
  FaExchangeAlt,
  FaGift,
  FaUser,
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiMenu } from "react-icons/fi"; // Hamburger icon
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/theme";


const menuItems = [
  { icon: <FaUser size={16} />, label: "Dashboard", route: "/dashboard" },
  { icon: <FaExchangeAlt size={16} />, label: "User Managment", route: "/user" },
//   { icon: <MdOutlineDashboard size={18} />, label: "Arbitrage", route: "" },
//   { icon: <FaGift size={16} />, label: "Mining", route: "" },
//   { icon: <FaChartLine size={16} />, label: "Leverage", route: "/tradeHistory" },
//   { icon: <FaChartLine size={16} />, label: "Activities", route: "" },
//   { icon: <FaChartLine size={16} />, label: "Statistics", route: "" },
  { icon: <FaComments size={16} />, label: "Chat", route: "/chatAdmin" },
  { icon: <FaCogs size={16} />, label: "Assignment", route: "/assignments" },
  { icon: <FaCogs size={16} />, label: "Wallet", route: "/wallet" },
  { icon: <FaExchangeAlt size={16} />, label: "Sweep", route: "/sweep" },
  { icon: <FaCogs size={16} />, label: "KYC Manager", route: "/kycManager" },
  { icon: <FaCogs size={16} />, label: "Trade Manager", route: "/tradeProfileManager" },
  { icon: <FaCogs size={16} />, label: "Top Up", route: "/topup" },
  { icon: <FaCogs size={16} />, label: "Withdraw", route: "/withdraw" },
  { icon: <FaCogs size={16} />, label: "Withdraw-Request", route: "/withdrawrequest" },
  // { icon: <FaCogs size={16} />, label: "Settings", route: "" },
  { icon: <FaCogs size={16} />, label: "Logout", route: "/logout" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminRole, setAdminRole] = useState<"ADMIN" | "SUPERADMIN" | null>(null);
  const pathname = usePathname();

  // NEW: routes without sidebar/header
  const HIDE_SIDEBAR_ROUTES = ["/login", "/auth/login"];
  const hideChrome = HIDE_SIDEBAR_ROUTES.some(r => pathname === r);

  // Show loading spinner when navigating
  const handleNav = (route: string) => {
    if (pathname !== route) {
      setLoading(true);
      window.location.href = route;
    } else {
      setDrawerOpen(false);
    }
  };

  // Fetch current admin role based on session cookie
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/login', { method: 'GET', credentials: 'include' });
        if (!res.ok) { setAdminRole(null); return; }
        const data = await res.json();
        if (!alive) return;
        const role = data?.admin?.role;
        setAdminRole(role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN');
      } catch {
        if (alive) setAdminRole(null);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (hideChrome) {
    return (
      <html lang="en">
        <body>
          {loading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black bg-opacity-40">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
          )}
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" style={{ background: COLORS.background }}>
      <body style={{ background: COLORS.background }}>
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black bg-opacity-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}
        <div className="flex min-h-screen">
          {/* Mobile top bar */}
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between backdrop-blur-lg p-4 lg:hidden" style={{ background: COLORS.background, borderBottom: `1px solid ${COLORS.purple}` }}>
            <button
              onClick={() => setDrawerOpen(true)}
              className="hover:opacity-80"
              style={{ color: COLORS.neonGreen }}
            >
              <FiMenu size={24} />
            </button>
            <h2 className="font-bold text-lg" style={{ color: COLORS.neonGreen }}>ProCryptoTrading</h2>
            <div className="w-6" /> {/* Spacer for balance */}
          </header>

          {/* Mobile overlay */}
          {drawerOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed top-0 left-0 z-50 h-full w-72 backdrop-blur-lg transform transition-transform duration-300 ease-in-out
              ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:static`}
            style={{ background: COLORS.background, borderRight: `1px solid ${COLORS.purple}` }}
          >
            {/* Sidebar header */}
            <div className="p-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${COLORS.purple}` }}>
              <div>
                <h2 className="font-bold text-xl" style={{ color: COLORS.neonGreen }}>ProCryptoTrading</h2>
                <p className="text-sm" style={{ color: COLORS.white }}>MID: 60600243</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="lg:hidden hover:opacity-80"
                style={{ color: COLORS.neonGreen }}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {/* Determine items based on role: SUPERADMIN -> all, ADMIN -> only Chat */}
              {adminRole === null && (
                <div className="text-sm text-gray-500 dark:text-gray-400 p-3">Loading menu…</div>
              )}
              {(adminRole !== null ? (adminRole === 'ADMIN' ? menuItems.filter(m => m.label === 'Chat' || m.label === 'Top Up' || m.label === 'Logout') : menuItems) : []).map((item, index) => {
                const isActive = pathname === item.route;
                return (
                  <button
                    key={index}
                    className={`flex items-center w-full space-x-3 p-3 rounded-xl transition-all duration-200`}
                    style={isActive ? { background: 'rgba(75, 0, 130, 0.2)', color: COLORS.neonGreen } : { color: COLORS.white }}
                    onClick={() => {
                      handleNav(item.route);
                      setDrawerOpen(false);
                    }}
                  >
                    <span style={{ color: COLORS.purple }}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1  pt-16 lg:pt-6 ">
            {children}
            {/* Floating Chat Button */}
            {/* {
             pathname != '/chat' && (
              <button
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:scale-105 transition-transform"
              onClick={() => handleNav("/chat")}
              aria-label="Chat with Customer Service"
            >
              <FaComments size={22} />
              <span className="hidden sm:inline font-semibold">Chat</span>
            </button>
             )
            } */}
            
          </main>
        </div>
      </body>
    </html>
  );
}
