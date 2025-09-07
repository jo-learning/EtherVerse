"use client";
import { FaWallet, FaChartLine, FaCoins, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import { GiProfit } from "react-icons/gi";
import WalletConnectButton from "@/components/ConnectButton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";


const COLORS = {
  purple: "#4b0082", // Dark purple
  neonGreen: "#39FF14", // Neon green
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042", // Slightly lighter navy blue
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

export default function HomePage() {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  // const { setLoading } = useLoading();

  const createUser = async (address: string) => {
    try {
      await fetch("/api/creatUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
    window.location.href = "/account";
  };

  useEffect(() => {
    if (isConnected) {
      setLoading(true);
      const address = window.ethereum?.selectedAddress;
      if (address) {
        createUser(address);
      }
      setLoading(false);
    }
  }, [isConnected]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <FaExchangeAlt className="text-2xl" />,
      title: "Instant Swaps",
      description: "Trade tokens instantly with minimal slippage"
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Advanced Charts",
      description: "Professional trading tools and real-time analytics"
    },
    {
      icon: <FaCoins className="text-2xl" />,
      title: "Earn Yield",
      description: "Put your assets to work with yield farming"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Secure",
      description: "Non-custodial platform with battle-tested security"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-purple-500/10 animate-pulse"
            style={{
              width: Math.random() * 300 + 100 + 'px',
              height: Math.random() * 300 + 100 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 10 + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center"
                  style={{ background: COLORS.white, backgroundColor: COLORS.white, opacity: 0.4 }}>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
                    style={{ borderColor: COLORS.purple }}></div>
                </div>
      )}

      <div className="container mx-auto px-4 py-5 relative z-10">
        {/* Header/Navigation */}
        <header className="flex justify-between items-center py-6 mb-8">
          <div className="flex items-center space-x-2">
            <FaWallet className="text-purple-400 text-3xl" />
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              EtherTrade
            </span>
          </div>
          
          {/* <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
            <a href="#markets" className="hover:text-purple-300 transition-colors">Markets</a>
            <a href="#faq" className="hover:text-purple-300 transition-colors">FAQ</a>
            <WalletConnectButton />
          </div> */}
          
          {/* <div className="md:hidden">
            <WalletConnectButton />
          </div> */}
        </header>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between ">
          <div className="md:w-1/2 mb-12 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Trade Crypto with <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Zero Fees</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-lg mx-auto md:mx-0">
              Advanced decentralized trading platform with deep liquidity, professional tools, and secure self-custody.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {/* <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-purple-500/30">
                Start Trading
              </button>
              <button className="border border-purple-400 text-purple-300 hover:bg-purple-900/40 font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                Explore Markets
              </button> */}
              <WalletConnectButton />
            </div>
            
            {/* <div className="mt-12 flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">$2.1B+</div>
                <div className="text-sm opacity-75">Volume 24h</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">250+</div>
                <div className="text-sm opacity-75">Trading Pairs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">150K+</div>
                <div className="text-sm opacity-75">Active Traders</div>
              </div>
            </div> */}
          </div>
          
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/home.jpg"
            alt="Crypto Trading Illustration"
            className="w-full max-w-md rounded-3xl shadow-lg animate-float"
            loading="lazy"
          />
        </div>
        </div>

        {/* Features Section */}
        {/* <section id="features" className="py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Trading Features</h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">Everything you need for successful decentralized trading</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border transition-all duration-500 ${activeFeature === index ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-gray-700/50 hover:border-purple-400/50'}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`mb-4 inline-flex rounded-2xl p-3 ${activeFeature === index ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800/50 text-gray-300'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="opacity-80">{feature.description}</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* CTA Section */}
        {/* <section className="py-16 text-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl my-16 backdrop-blur-md border border-purple-500/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Connect your wallet and experience the future of decentralized trading</p>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </section> */}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/70 text-sm border-t border-gray-800/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FaWallet className="text-purple-400" />
              <span className="font-semibold">EtherTrade</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-purple-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-300 transition-colors">Docs</a>
              <a href="#" className="hover:text-purple-300 transition-colors">Contact</a>
            </div>
            <div>&copy; {new Date().getFullYear()} EtherTrade. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* Mobile menu button (would need state to toggle) */}
      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes drawChart {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-drawChart {
          animation: drawChart 3s ease-in-out forwards;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}