import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import Hero from './components/Hero';
import MovieJudgePanel from './components/MovieJudgePanel';
import NarrativeText from './components/NarrativeText';
import CommunityPoll from './components/CommunityPoll';
import Footer from './components/Footer';
import GalaxyBackground from './components/GalaxyBackground';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0B10] text-[#F2F4F8]">
      <GalaxyBackground />
      
      {/* Persistent Verdict Logo */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold font-space-grotesk text-[#00E0FF]">
          <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
          <span>Verdict</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <Hero onOpenPanel={() => setIsPanelOpen(true)} />
        
        <MovieJudgePanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
        
        <NarrativeText />
        <CommunityPoll />
        <Footer />
      </div>
    </div>
  );
}

export default App;