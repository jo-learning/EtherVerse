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
import { usePathname, useRouter } from "next/navigation";
import { LoadingProvider } from "@/components/loadingPage";

// var uId = 60600242;

const menuItems = [
  { icon: <FaUser size={16} />, label: "Account", route: "/account" },
  { icon: <FaExchangeAlt size={16} />, label: "Trans...", route: "/trade" },
  { icon: <MdOutlineDashboard size={18} />, label: "Arbitrage", route: "" },
  { icon: <FaGift size={16} />, label: "Mining", route: "" },
  { icon: <FaChartLine size={16} />, label: "Leverage", route: "/leverage" },
  { icon: <FaChartLine size={16} />, label: "Activities", route: "" },
  { icon: <FaChartLine size={16} />, label: "Statistics", route: "" },
  { icon: <FaComments size={16} />, label: "Chat", route: "/chat" },
  { icon: <FaCogs size={16} />, label: "Settings", route: "/setting" },
];

// Neon color palette
export const COLORS = {
  purple: "#4b0082",      // Dark purple
  neonGreen: "#39FF14",   // Neon green
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uId, setUId] = useState(60600242)
  const router = useRouter();
  const pathname = usePathname();

  const getUserId = async () => {
    try {
      const address = window.ethereum?.selectedAddress;
      if (!address) {
        console.error("No Ethereum address found");
        // uId = 1111;
        setUId(1111)
        return;
      }
      const response = await fetch(`/api/getId?userId=${address}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      const uId1 = data.uId.userId;
      setUId(uId1)
      // console.log(data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleNav = (route: string) => {
    if (pathname !== route) {
      setLoading(true);
      window.location.href = route;
    } else {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  const showBackButton = pathname.split("/").length === 3 || pathname.split("/").length === 4;
  const showSavingButton = pathname.split("/").length === 3 && pathname.startsWith("/wallets");
  let coin = "";
  if (showSavingButton) {
    coin = pathname.split("/")[2];
  }

  return (
    <html lang="en">
      <body style={{ background: COLORS.background, overflowX: "hidden" }}>
        {/* Loading Overlay */}
        {loading && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
              background: COLORS.white,
              backgroundColor: COLORS.white,
              opacity: 0.4,
            }}
          >
            <div
              className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
              style={{ borderColor: COLORS.purple }}
            ></div>
          </div>
        )}
        <div className="flex min-h-screen">
          {/* Mobile top bar */}
          <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between backdrop-blur-lg border-b p-4 lg:hidden"
            style={{
              background: COLORS.background,
              borderColor: COLORS.purple,
            }}
          >
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="mr-2 text-white hover:text-purple-300"
                  aria-label="Back"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setDrawerOpen(true)}
                className="hover:text-purple-600"
                style={{ color: COLORS.white }}
              >
                <FiMenu size={24} />
              </button>
            </div>
            <h2 className="font-bold text-lg" style={{ color: COLORS.white }}>
              EtherVerse
            </h2>
            <div className="w-6" />
            {showSavingButton && (
              <button
                onClick={() => (window.location.href = `/wallets/${coin}/transaction`)}
                className="mr-2 text-white hover:text-purple-300"
                aria-label="Save"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Save">
                  <title>Save</title>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 9h10v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                </svg>
              </button>
            )}
          </header>

          {/* Mobile overlay */}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: COLORS.black, opacity: 0.7 }}
              onClick={() => setDrawerOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed top-0 left-0 z-50 h-full w-72 backdrop-blur-lg border-r transform transition-transform duration-300 ease-in-out
              ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:static`}
            style={{
              background: COLORS.background,
              borderColor: COLORS.purple,
              overflowY: "auto", // Allow scrolling inside sidebar if necessary
            }}
          >
            {/* Sidebar header */}
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: COLORS.purple }}>
              <div>
                <h2 className="font-bold text-xl" style={{ color: COLORS.white }}>
                  EtherVerse
                </h2>
                <p className="text-sm" style={{ color: COLORS.white }}>
                  UID: {uId}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="lg:hidden"
                style={{ color: COLORS.white }}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 grid grid-cols-2 gap-4 overflow-hidden">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.route;
                return (
                  <button
                    key={index}
                    className={`flex items-center justify-start space-x-3 p-3 rounded-xl transition-all duration-200 font-medium`}
                    style={{
                      background: isActive ? COLORS.white + "20" : undefined,
                      color: isActive ? COLORS.white : COLORS.white,
                      fontWeight: isActive ? "bold" : undefined,
                    }}
                    onClick={() => {
                      handleNav(item.route);
                      setDrawerOpen(false);
                    }}
                  >
                    <span style={{ color: COLORS.purple }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 pt-16 lg:pt-6 overflow-x-hidden">
            <LoadingProvider loading={false}>{children}</LoadingProvider>

            {/* Floating Chat Button */}
            {pathname !== "/chat" && (
              <button
                                className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg p-4 flex items-center gap-2 hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.purple} 0%, ${COLORS.neonGreen} 100%)`,
                  color: COLORS.white,
                }}
                onClick={() => handleNav("/chat")}
                aria-label="Chat with Customer Service"
              >
                <FaComments size={22} />
                <span className="hidden sm:inline font-semibold">Chat</span>
              </button>
            )}
          </main>
        </div>
      </body>
    </html>
  );
}

