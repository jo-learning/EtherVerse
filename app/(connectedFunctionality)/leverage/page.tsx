"use client";
import { FaHeadset } from "react-icons/fa";
import Link from "next/link";

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

export default function LeaveragePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: COLORS.background, color: COLORS.textWhite }}
    >
      <div
        className="max-w-lg w-full text-center space-y-8 rounded-3xl px-8 py-12 shadow-2xl"
        style={{
          background: COLORS.navy,
          color: COLORS.textWhite,
          border: `1px solid ${COLORS.purple}`,
        }}
      >
        <FaHeadset size={48} className="mx-auto mb-4" style={{ color: COLORS.neonGreen }} />
        <h1
          className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-lg"
          style={{ color: COLORS.neonGreen }}
        >
          Need Leverage?
        </h1>
        <p className="text-lg md:text-xl mb-6" style={{ color: COLORS.textGray }}>
          To request leverage, please contact our customer service team. We're here to assist you with personalized solutions.
        </p>
        <Link href="/chat">
          <button
            className="px-6 py-3 rounded-xl font-semibold transition"
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
            Contact Customer Service
          </button>
        </Link>
      </div>
      <footer
        className="absolute bottom-6 w-full text-center text-sm"
        style={{ color: COLORS.textGray }}
      >
        &copy; {new Date().getFullYear()} EtherVerse. All rights reserved.
      </footer>
    </div>
  );
}
