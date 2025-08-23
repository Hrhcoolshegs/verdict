import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`${className} bg-gray-800 flex items-center justify-center relative overflow-hidden`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="projector-loading"></div>
        </div>
      )}
      {!isLoaded && isInView && (
        <div className="film-loading-skeleton absolute inset-0"></div>
      )}
    </div>
  );
};

export default LazyImage;