import React, { useEffect, useState } from 'react';

const NarrativeText: React.FC = () => {
  const [visibleIndex, setVisibleIndex] = useState(-1);

  const narratives = [
    "In the beginning, you press play...\n\nA story flickers to life.\nA world unfolds...",
    "Some films stumble,\nfading before they even begin...\n\nOthers carry you,\nframe by frame,\ninto something greater...",
    "They ignite.\nThey linger.\nThey demand to be remembered.",
    "Those are not just movies.\n\nThey are Cinema."
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (index !== visibleIndex) {
              setVisibleIndex(index);
            }
          }
        });
      },
      { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' }
    );

    const elements = document.querySelectorAll('.narrative-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {narratives.map((text, index) => (
          <div
            key={index}
            data-index={index}
            className="narrative-item min-h-screen flex items-center justify-center px-4"
          >
            <div className={`transform transition-all duration-1000 ease-out ${
              index === visibleIndex ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl cinema-title text-center leading-relaxed text-[#F2F4F8] max-w-4xl text-shadow-lg parallax-slow">
                {text.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NarrativeText;