import React from 'react';
import { Github, MessageCircle, Scale, Info, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToVerdict = () => {
    const verdictSection = document.querySelector('[data-section="verdict"]');
    if (verdictSection) {
      verdictSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/2348068569908', '_blank');
  };

  const links = [
    { label: 'About', icon: Info, href: '#' },
    { label: 'Verdict', icon: Scale, onClick: scrollToVerdict },
    { label: 'Contact', icon: MessageCircle, onClick: openWhatsApp },
    { label: 'GitHub', icon: Github, href: 'https://github.com/Hrhcoolshegs' },
    { label: 'Twitter', icon: Twitter, href: 'https://x.com/hrhcoolshegs' },
  ];

  return (
    <footer className="py-20 px-6 border-t border-[rgba(255,215,0,0.1)]">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg md:text-xl text-[#A6A9B3] mb-10 leading-relaxed">
          A Project by <span className="text-[#00E0FF] font-semibold font-space-grotesk">Oluwasegun Akinshola Lawrence</span>. 
          <br className="md:hidden" />
          Because life's too short for bad movies.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {links.map((link) => {
            const Icon = link.icon;
            
            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="flex items-center gap-2 px-4 py-3 text-[#A6A9B3] hover:text-[#00E0FF] transition-colors group focus:outline-none focus:ring-2 focus:ring-[#00E0FF] focus:ring-opacity-50 rounded-lg"
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              );
            }
            
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href?.startsWith('http') ? '_blank' : undefined}
                rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 px-4 py-3 text-[#A6A9B3] hover:text-[#00E0FF] transition-colors group focus:outline-none focus:ring-2 focus:ring-[#00E0FF] focus:ring-opacity-50 rounded-lg"
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">{link.label}</span>
              </a>
            );
          })}
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(0,224,255,0.1)] to-transparent mb-10"></div>
        
        <p className="text-xs text-[#A6A9B3] font-space-grotesk">
          © 2025 Is It Cinema? • Made with passion for the art of film
        </p>
      </div>
    </footer>
  );
};

export default Footer;