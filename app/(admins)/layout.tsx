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
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiMenu } from "react-icons/fi"; // Hamburger icon
import { usePathname } from "next/navigation";


const menuItems = [
  { icon: <FaUser size={16} />, label: "Dashboard", route: "/dashboard" },
  { icon: <FaExchangeAlt size={16} />, label: "User Managment", route: "/user" },
//   { icon: <MdOutlineDashboard size={18} />, label: "Arbitrage", route: "" },
//   { icon: <FaGift size={16} />, label: "Mining", route: "" },
//   { icon: <FaChartLine size={16} />, label: "Leverage", route: "/tradeHistory" },
//   { icon: <FaChartLine size={16} />, label: "Activities", route: "" },
//   { icon: <FaChartLine size={16} />, label: "Statistics", route: "" },
  { icon: <FaComments size={16} />, label: "Chat", route: "/adminChat" },
  { icon: <FaCogs size={16} />, label: "Wallet", route: "/wallet" },
  { icon: <FaCogs size={16} />, label: "Settings", route: "" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <html lang="en">
      <body>
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black bg-opacity-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}
        <div className="flex min-h-screen">
          {/* Mobile top bar */}
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700 p-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <FiMenu size={24} />
            </button>
            <h2 className="font-bold text-lg text-purple-600 dark:text-purple-400">
              EtherVerse
            </h2>
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
            className={`fixed top-0 left-0 z-50 h-full w-72 bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
              ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:static`}
          >
            {/* Sidebar header */}
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl text-purple-600 dark:text-purple-400">
                  EtherVerse
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  MID: 60600243
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.route;
                return (
                  <button
                    key={index}
                    className={`flex items-center w-full space-x-3 p-3 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-purple-600/20 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold"
                          : "hover:bg-purple-100/50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    onClick={() => {
                      handleNav(item.route);
                      setDrawerOpen(false);
                    }}
                  >
                    <span className="text-purple-600 dark:text-purple-400">
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
