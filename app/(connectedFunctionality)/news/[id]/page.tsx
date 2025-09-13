// app/news/[id]/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { NEWS } from "@/lib/data"; // Assuming you have a NEWS array

// Color palette (same as your existing colors)
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

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsItem = NEWS.find(item => item.id === parseInt(params.id));

  if (!newsItem) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: COLORS.background }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: COLORS.textWhite }}>News Not Found</h1>
          <Link href="/" className="text-blue-400 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: COLORS.background, color: COLORS.textWhite }}>
      {/* Header with back button */}
      {/* <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS.neonGreen }}>
          <FaArrowLeft />
          Back to Home
        </Link>
      </div> */}

      {/* News Content */}
      <div className="max-w-4xl mx-auto">
        {/* News Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={newsItem.image}
              alt={newsItem.source}
              className="w-16 h-16 rounded-lg"
              style={{ border: `2px solid ${COLORS.textGray}` }}
            />
            <div>
              <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{
                background: COLORS.purple,
                color: COLORS.white,
              }}>
                {newsItem.source}
              </span>
              <p className="text-sm mt-1" style={{ color: COLORS.textGray }}>{newsItem.time}</p>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: COLORS.neonGreen }}>
            {newsItem.title}
          </h1>
        </div>

        {/* News Image */}
        <div className="mb-6">
          <img
            src={newsItem.image}
            alt={newsItem.title}
            className="w-full h-64 object-cover rounded-xl"
          />
        </div>

        {/* News Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-lg leading-relaxed mb-6" style={{ color: COLORS.textWhite }}>
            {newsItem.content || `Stay updated with the latest developments in ${newsItem.source}. This news highlights important market movements and trends that could impact your trading decisions.`}
          </div>
          
          <div className="p-4 rounded-xl mb-6" style={{ background: COLORS.navy, border: `1px solid ${COLORS.purple}` }}>
            <h3 className="font-semibold mb-2" style={{ color: COLORS.neonGreen }}>Key Takeaways:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Market impact analysis</li>
              <li>Trading opportunities</li>
              <li>Risk assessment</li>
              <li>Future predictions</li>
            </ul>
          </div>

          <p className="mb-6" style={{ color: COLORS.textWhite }}>
            For more detailed information, you can read the full article on the official source website.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <a
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              background: `linear-gradient(90deg, ${COLORS.neonGreen}, ${COLORS.purple})`,
              color: COLORS.black,
            }}
          >
            Read Full Article
          </a>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg font-semibold border transition-colors"
            style={{
              borderColor: COLORS.purple,
              color: COLORS.textWhite,
            }}
          >
            Back to Trading
          </Link>
        </div>

        {/* Related News */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: COLORS.purple }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.neonGreen }}>Related News</h2>
          <div className="grid gap-4">
            {NEWS.filter(item => item.id !== newsItem.id).slice(0, 3).map((related) => (
              <Link
                key={related.id}
                href={`/news/${related.id}`}
                className="block p-4 rounded-xl hover:scale-[1.02] transition-transform"
                style={{
                  background: COLORS.navy,
                  border: `1px solid ${COLORS.purple}`,
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: COLORS.textWhite }}>{related.title}</h3>
                <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.textGray }}>
                  <span>{related.source}</span>
                  <span>•</span>
                  <span>{related.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}