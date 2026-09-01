"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../siteConfig';
import { VIDEOS, OVERLAY_IMAGE } from './LumoraHero';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const exitSplash = () => {
    setShow(false);
    if (readyTimer.current) clearTimeout(readyTimer.current);
    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    try {
      sessionStorage.setItem('hasSeenSplash', 'true');
    } catch {}

    setTimeout(() => {
      document.documentElement.classList.add('splash-seen');
    }, 300);
  };

  useEffect(() => {
    setIsMounted(true);
    setShow(true);
    readyTimer.current = setTimeout(() => setReady(true), 4500);

    const useLumora = siteConfig.homepageHero === 'lumora';
    if (useLumora) {
      autoAdvanceTimer.current = setInterval(() => {
        setActiveVideo((prev) => (prev + 1) % VIDEOS.length);
      }, 4000);
    }

    return () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
      if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeVideo) {
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeVideo, show]);

  useEffect(() => {
    const nextUrl = VIDEOS[(activeVideo + 1) % VIDEOS.length].url;
    try {
      fetch(nextUrl, { headers: { Range: 'bytes=0-2097152' } }).catch(() => {});
    } catch {}
  }, [activeVideo]);

  if (!isMounted) return null;

  const useLumora = siteConfig.homepageHero === 'lumora';

  return (
    <AnimatePresence>
      {show && useLumora && (
        <motion.div
          key="lumora-splash"
          exit={{ opacity: 0, scale: 1.08, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] overflow-hidden bg-black"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.16),transparent_55%),linear-gradient(135deg,#020617,#0f172a_55%,#1e1b4b)]" />
            {VIDEOS.map((video, index) => (
              <video
                key={video.url}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={video.url}
                muted
                loop
                playsInline
                preload="auto"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === activeVideo ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <img
              src={OVERLAY_IMAGE}
              alt=""
              className="train-bob absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/15" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
            <div className="relative px-8 py-12 sm:px-16 sm:py-16">
              <AnimatePresence>
                {ready && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                  <div className="flex flex-col items-center">
                    <span
                      className="text-sm font-black italic uppercase tracking-[0.55em] text-cyan-200 sm:text-lg"
                      style={{ textShadow: '0 0 18px rgba(34,211,238,0.8), 0 0 42px rgba(244,114,182,0.45)' }}
                    >
                      Welcome
                    </span>
                    <h1
                      className="mt-2 bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-5xl font-black uppercase tracking-[0.18em] text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.45)] sm:text-7xl"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      linfannet
                    </h1>
                    <div className="mt-5 h-px w-24 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    <p className="mt-4 text-xs tracking-[0.5em] text-white/80 sm:text-sm">
                      LinFan PERSONAL UNIVERSE
                    </p>
                  </div>
                  <button
                    onClick={exitSplash}
                    className="mt-10 rounded-full border border-cyan-300/60 bg-transparent px-14 py-4 text-base font-black uppercase tracking-[0.4em] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all duration-300 hover:scale-105 hover:border-pink-300/70 hover:text-white hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] sm:px-16 sm:py-5 sm:text-lg"
                    style={{ textShadow: '0 0 18px rgba(34,211,238,0.7)' }}
                  >
                    Enter
                  </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!ready && (
                <p className="text-[10px] tracking-[0.5em] text-white/40">
                  LOADING IMMERSIVE SPACE...
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {show && !useLumora && (
        <motion.div
          key="splash-screen-container"
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-[3px]"
              />
              <div className="relative w-full h-full rounded-full p-1.5 bg-white dark:bg-slate-900 shadow-xl">
                <img src={siteConfig.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-[0.2em] uppercase">
              {siteConfig.authorName}
            </h1>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.5em] mb-12">INITIALIZING SYSTEM</p>

            <div className="w-40 h-[1.5px] bg-slate-200 dark:bg-slate-800 relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
