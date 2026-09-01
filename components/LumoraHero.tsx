"use client";

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

export const VIDEOS = [
  {
    url: '/lumora/golden-hour.mp4',
    label: 'Golden Hour',
  },
  {
    url: '/lumora/still-water.mp4',
    label: 'Still Water',
  },
  {
    url: '/lumora/deep-woods.mp4',
    label: 'Deep Woods',
  },
  {
    url: '/lumora/quiet-dawn.mp4',
    label: 'Quiet Dawn',
  },
];

export const OVERLAY_IMAGE =
  '/lumora/overlay.png';

const NAV_LINKS = ['How It Works', 'Features', 'Pricing', 'Community'];
const STATS = ['60+ Deep Sessions', '12,000+ Creators', '4.8 User Satisfaction', 'Intentional-First Design'];

export default function LumoraHero({
  fontClass = '',
  embedded = false,
}: {
  fontClass?: string;
  embedded?: boolean;
}) {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const switchVideo = (index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setActiveVideo(index);
    setIsTransitioning(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 1000);
  };

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  const isDarkHero = activeVideo === 2;
  const heroColor = isDarkHero ? '#182C41' : '#ffffff';

  return (
    <section className="lumora-hero relative w-full h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {VIDEOS.map((video, index) =>
          index === activeVideo ? (
            <video
              key={video.url}
              src={video.url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null
        )}
        <img
          src={OVERLAY_IMAGE}
          alt=""
          className="train-bob absolute inset-0 z-[1] h-full w-full object-cover"
        />
      </div>

      <div
        className={`relative z-[2] flex h-full flex-col px-6 py-5 sm:px-10 sm:py-7 ${
          embedded ? 'pt-20 sm:pt-24' : ''
        }`}
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {!embedded && (
          <nav className="flex items-center justify-between">
            <span
              className={`text-xl italic sm:text-2xl ${fontClass}`}
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Lumora
            </span>

            <div className="liquid-glass hidden items-center gap-1 rounded-full p-1.5 pr-2 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="px-4 py-2 text-sm text-white/90 transition-colors hover:text-white"
                >
                  {link}
                </a>
              ))}
              <button className="ml-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
                Get Started
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </nav>
        )}

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div
            className="liquid-glass rounded-full px-4 py-2 text-xs text-white/90 sm:text-sm"
            style={{ color: isDarkHero ? '#182C41' : undefined }}
          >
            Over 10,000 minds already finding their clarity
          </div>

          <h1
            className={`mt-6 max-w-4xl text-4xl leading-[1.1] sm:text-5xl md:text-7xl lg:text-[5.5rem] ${fontClass}`}
            style={{ fontFamily: "'Instrument Serif', serif", color: heroColor }}
          >
            Clarity in an Endlessly
            <br />
            Noisy Universe
          </h1>

          <p
            className="mt-6 max-w-xl leading-relaxed text-white/80"
            style={{ color: isDarkHero ? '#182C41' : undefined }}
          >
            Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to
            protect your presence and create with intention.
          </p>

          <div className="liquid-glass mt-8 flex w-full max-w-xs items-center rounded-full p-1.5 sm:max-w-sm">
            <input
              type="email"
              placeholder="Your Best Email"
              className="w-full bg-transparent px-4 py-2 text-sm outline-none placeholder:text-white/60"
              style={{ color: isDarkHero ? '#182C41' : '#ffffff' }}
            />
            <button className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black sm:px-5">
              Get Early Access
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {VIDEOS.map((video, index) => (
              <button
                key={video.label}
                onClick={() => switchVideo(index)}
                className={`border-b-2 pb-2 text-xs transition-all sm:text-sm ${
                  index === activeVideo
                    ? 'border-white font-semibold text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
                style={
                  index === activeVideo && isDarkHero
                    ? { color: '#182C41', borderColor: '#182C41' }
                    : undefined
                }
              >
                {video.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center gap-4 text-xs text-white/70 sm:text-sm md:flex">
          {STATS.map((stat, index) => (
            <div key={stat} className="flex items-center gap-4">
              {index > 0 && <span>|</span>}
              <span>{stat}</span>
            </div>
          ))}
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <button
            onClick={() => setMenuOpen(false)}
            className="liquid-glass absolute right-6 top-5 flex h-11 w-11 items-center justify-center rounded-full text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
          <div className="flex h-full flex-col items-center justify-center gap-6">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link}
                href="#"
                className="text-3xl text-white"
                style={{
                  animation: `lumoraMenuIn 500ms ${100 + index * 50}ms cubic-bezier(0.4, 0, 0.2, 1) both`,
                }}
              >
                {link}
              </a>
            ))}
            <button
              className="mt-6 rounded-full bg-white px-8 py-3 font-semibold text-black"
              style={{ animation: 'lumoraMenuIn 500ms 350ms cubic-bezier(0.4, 0, 0.2, 1) both' }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
