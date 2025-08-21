import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  onOpenPanel: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenPanel }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    // Opening credits style animation
    const titleTimer = setTimeout(() => setTitleVisible(true), 300);
    const contentTimer = setTimeout(() => setIsVisible(true), 800);
    
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <div
          className={`transform transition-all duration-1500 ease-out ${
            titleVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90'
          }`}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-space-grotesk mb-6 leading-none text-shadow-lg">
            <span className="text-[#A6A9B3]">Is It </span>
            <span className="text-[#F2F4F8]">Cinema?</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-[#A6A9B3] mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed px-4">
            Not every movie is Cinema. We tell you which ones are.
          </p>
        </div>

        <div
          className={`transform transition-all duration-1200 ease-out delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
          }`}
        >
          <button
            onClick={onOpenPanel}
            className="group relative inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#00E0FF] to-[#00C0E0] text-[#0B0B10] font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00E0FF]/25"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            <span className="text-base sm:text-lg">Judge a Movie</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E0FF] to-[#00C0E0] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={onOpenPanel}
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 bg-[#00E0FF] text-[#0B0B10] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 shadow-[#00E0FF]/25"
      >
        <Search className="w-6 h-6" />
      </button>
    </section>
  );
};

export default Hero;