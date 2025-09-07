// components/CryptoCarousel.jsx
'use client';

import { useState, useEffect } from 'react';

const CryptoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // 0: forward, 1: backward
  
  const slides = [
    {
      title: "Start Trading Crypto",
      description: "Join the world's largest exchange and get a bonus!",
      buttonText: "Trade Now",
      buttonColor: "from-purple-600 to-blue-500",
      image: "slider 1.jpg", // Your image path
      cryptoElements: ["₿", "Ξ", "◎"]
    },
    {
      title: "Secure Crypto Wallet",
      description: "Store your digital assets safely with military-grade encryption",
      buttonText: "Learn More",
      buttonColor: "from-green-500 to-teal-500",
      image: "slider 1.jpg", // Your image path
      cryptoElements: ["₿", "€", "£"]
    },
    {
      title: "Advanced Market Analysis",
      description: "Get real-time insights with professional trading tools",
      buttonText: "Explore Tools",
      buttonColor: "from-orange-500 to-red-500",
      image: "slider 1.jpg", // Your image path
      cryptoElements: ["$", "¥", "₿"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(0);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setDirection(0);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 0 : 1);
    setCurrentSlide(index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-8 px-4"> {/* Reduced max-width */}
      
      <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-cyan-500/10">
        {/* Carousel Container */}
        <div className="relative w-full h-40 md:h-80"> {/* Adjusted height */}
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
              {/* Background Image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
              </div>
              
              {/* Animated crypto elements floating in background */}
              {/* {slide.cryptoElements.map((element, i) => (
                <div 
                  key={i}
                  className="absolute text-3xl opacity-30 animate-float"
                  style={{
                    top: `${20 + (i * 25)}%`,
                    left: `${10 + (i * 25)}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${5 + i * 2}s`
                  }}
                >
                  {element}
                </div>
              ))} */}
              
              {/* Main slide content */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden ">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                <div className="absolute inset-0 flex flex-col justify-start items-start pt-5 pl-2 pr-15 md:pl-10 text-white">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-lg max-w-xs">
                    {slide.title}
                  </h2>
                  <p className="text-sm mb-4 drop-shadow-md max-w-xs text-gray-100">
                    {slide.description}
                  </p>
                  {/* <button className={`bg-gradient-to-r ${slide.buttonColor} hover:scale-105 transition-transform text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/10`}>
                    {slide.buttonText}
                  </button> */}
                </div>
                
                {/* Digital particles effect */}
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
        
        {/* Navigation Arrows */}
        {/* <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-lg text-white rounded-full p-2 hover:bg-cyan-500/30 transition-all duration-300 border border-white/10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-lg text-white rounded-full p-2 hover:bg-cyan-500/30 transition-all duration-300 border border-white/10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button> */}
        
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

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default CryptoCarousel;