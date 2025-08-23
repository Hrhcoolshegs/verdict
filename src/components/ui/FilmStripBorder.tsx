import React from 'react';

interface FilmStripBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'modal' | 'section';
  animated?: boolean;
}

const FilmStripBorder: React.FC<FilmStripBorderProps> = ({ 
  children, 
  className = '', 
  variant = 'card',
  animated = false 
}) => {
  const sprocketHoles = Array.from({ length: 20 }, (_, i) => i);
  
  const baseClasses = "relative overflow-hidden";
  const variantClasses = {
    card: "rounded-lg",
    modal: "rounded-2xl",
    section: "rounded-none"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Film grain overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}
      />
      
      {/* Left sprocket holes */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20 flex flex-col justify-evenly">
        {sprocketHoles.map((i) => (
          <div
            key={`left-${i}`}
            className={`w-2 h-2 bg-black/40 rounded-full mx-auto ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{
              animationDelay: animated ? `${i * 0.1}s` : undefined
            }}
          />
        ))}
      </div>
      
      {/* Right sprocket holes */}
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-black/20 flex flex-col justify-evenly">
        {sprocketHoles.map((i) => (
          <div
            key={`right-${i}`}
            className={`w-2 h-2 bg-black/40 rounded-full mx-auto ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{
              animationDelay: animated ? `${i * 0.1}s` : undefined
            }}
          />
        ))}
      </div>
      
      {/* Content area */}
      <div className="relative px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default FilmStripBorder;