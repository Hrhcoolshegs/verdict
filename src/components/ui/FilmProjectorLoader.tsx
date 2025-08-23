import React, { useState, useEffect } from 'react';

interface FilmProjectorLoaderProps {
  message?: string;
  subMessage?: string;
  duration?: number;
}

const FilmProjectorLoader: React.FC<FilmProjectorLoaderProps> = ({
  message = "Adjusting the projector lens...",
  subMessage = "Preparing your cinematic experience",
  duration = 3000
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Adjusting the projector lens...",
    "Loading film reel...",
    "Calibrating color grading...",
    "Syncing audio tracks...",
    "Preparing your verdict...",
    "Almost ready for showtime..."
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [duration]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Film Projector Animation */}
      <div className="relative">
        {/* Projector Body */}
        <div className="w-24 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg relative shadow-2xl">
          {/* Lens */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg">
            <div className="absolute inset-1 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full animate-pulse">
              <div className="absolute inset-1 bg-white/30 rounded-full animate-spin" />
            </div>
          </div>
          
          {/* Film Reels */}
          <div className="absolute -top-6 left-2 w-6 h-6 border-2 border-gray-600 rounded-full animate-spin">
            <div className="absolute inset-1 border border-gray-500 rounded-full">
              <div className="absolute inset-1 bg-gray-700 rounded-full" />
            </div>
          </div>
          <div className="absolute -top-6 right-2 w-6 h-6 border-2 border-gray-600 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}>
            <div className="absolute inset-1 border border-gray-500 rounded-full">
              <div className="absolute inset-1 bg-gray-700 rounded-full" />
            </div>
          </div>
          
          {/* Light Beam */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent opacity-60 animate-pulse" />
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-32 h-0.5 bg-gradient-to-r from-white via-blue-200 to-transparent animate-pulse" />
        </div>
        
        {/* Film Strip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-800 rounded overflow-hidden">
          <div className="absolute inset-0 flex">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex-1 border-r border-gray-600 relative">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full" />
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Loading Messages */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-[#00E0FF] animate-pulse">
          {currentMessage}
        </h3>
        <p className="text-sm text-[#A6A9B3]">
          {subMessage}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#00E0FF] to-[#00BFFF] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Vintage Film Countdown */}
      <div className="relative w-16 h-16 border-4 border-[#00E0FF] rounded-full flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-transparent border-t-[#00E0FF] rounded-full animate-spin" />
        <span className="text-2xl font-bold text-[#00E0FF] font-mono">
          {Math.ceil((100 - progress) / 20)}
        </span>
      </div>
    </div>
  );
};

export default FilmProjectorLoader;