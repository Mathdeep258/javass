"use client";
import { useState, useEffect } from 'react';
import { siteConfig } from '../siteConfig';

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<string[]>(siteConfig.bgImages || []);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      const isLocalPreview = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalPreview) return;
      try {
        const configRes = await fetch(`/backend_config.json?t=${Date.now()}`);
        if (!configRes.ok) return;
        const configData = await configRes.json();
        if (!configData?.api_port) return;
        const res = await fetch(`http://127.0.0.1:${configData.api_port}/api/config/get`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data?.bgImages) && data.data.bgImages.length > 0) {
          setImages(data.data.bgImages);
        }
      } catch {}
    };
    loadImages();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [images.length]);

  // Only the current and next layers get a backgroundImage so hidden layers are not downloaded.
  useEffect(() => {
    if (images.length <= 1) return;
    const nextImage = new Image();
    nextImage.src = images[(index + 1) % images.length];
  }, [index, images]);

  return (
    <div className="absolute inset-0 z-[-10] overflow-hidden">
      {images.map((img, i) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out transform-gpu ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={
            i === index || i === (index + 1) % images.length
              ? {
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
