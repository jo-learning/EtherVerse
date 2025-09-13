// components/CryptoCarousel.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const CryptoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // 0: forward, 1: backward
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      title: "Start Trading Crypto",
      description: "Join the world's largest exchange and get a bonus!",
      buttonText: "Trade Now",
      buttonColor: "from-purple-600 to-blue-500",
      image: "slider 1.jpg",
      cryptoElements: ["₿", "Ξ", "◎"],
      link: "/leverage"
    },
    {
      title: "Secure Crypto Wallet",
      description: "Store your digital assets safely with military-grade encryption",
      buttonText: "Learn More",
      buttonColor: "from-green-500 to-teal-500",
      image: "slider 1.jpg",
      cryptoElements: ["₿", "€", "£"],
      link: "/leverage"
    },
    {
      title: "Advanced Market Analysis",
      description: "Get real-time insights with professional trading tools",
      buttonText: "Explore Tools",
      buttonColor: "from-orange-500 to-red-500",
      image: "slider 1.jpg",
      cryptoElements: ["$", "¥", "₿"],
      link: "/leverage"
    }
  ];

  // auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(0);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 0 : 1);
    setCurrentSlide(index);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchEndX.current - touchStartX.current;
    if (diff > 50) {
      // swipe right → previous
      setDirection(1);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -50) {
      // swipe left → next
      setDirection(0);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-8 px-4">
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl shadow-cyan-500/10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Container */}
        <div className="relative w-full h-40 md:h-80">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100'
                  : direction === 0
                  ? 'opacity-0 -translate-x-10 scale-95'
                  : 'opacity-0 translate-x-10 scale-95'
              }`}
            >
              <Link href={slide.link} className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
              </Link>

              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                <div className="absolute inset-0 flex flex-col justify-start items-start pt-5 pl-2 md:pl-10 text-white">
                  <Link href={slide.link} className="cursor-pointer">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-lg max-w-xs hover:opacity-90 transition-opacity">
                      {slide.title}
                    </h2>
                  </Link>
                  <Link href={slide.link} className="cursor-pointer">
                    <p className="text-sm mb-4 drop-shadow-md max-w-xs text-gray-100 hover:opacity-90 transition-opacity">
                      {slide.description}
                    </p>
                  </Link>
                </div>

                {/* Digital particles */}
                <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden opacity-30">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/10 ${
                index === currentSlide
                  ? 'bg-cyan-400 scale-125 shadow-cyan-400/30 shadow-lg'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-400 text-xs">
        <p>Trusted by millions of users worldwide. Secure, fast, and reliable crypto trading.</p>
      </div>
    </div>
  );
};

export default CryptoCarousel;
