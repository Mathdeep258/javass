"use client";
import { useState, useEffect } from 'react';
import { siteConfig } from '../siteConfig';

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState<string[]>(siteConfig.bgImages || []);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
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
    }, 10000); // 10秒切换一次

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-[-10] overflow-hidden">
      {images.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out transform-gpu"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // 当前显示的图片 opacity 为 1，其他的为 0
            opacity: i === index ? 1 : 0,
            // 解决层级重叠导致的渲染压力
            visibility: Math.abs(i - index) <= 1 || (i === images.length - 1 && index === 0) ? 'visible' : 'hidden'
          }}
        />
      ))}
    </div>
  );
}
