"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { siteConfig } from '../siteConfig';

// 【增强版 LRC 歌词解析】
function parseLrc(lrcText: string) {
  if (!lrcText || lrcText.length > 30000) return [];

  const lines = lrcText.split(/\r?\n/);
  const result = [];

  for (let line of lines) {
    const matches = [...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)];
    if (matches.length > 0) {
      let text = line.replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

      // 剔除控制字符
      const cleanText = text.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");

      if (cleanText) {
        for (const match of matches) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3]) : 0;
          const divisor = match[3] && match[3].length === 3 ? 1000 : 100;
          const time = min * 60 + sec + ms / divisor;
          result.push({ time, text: cleanText });
        }
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

const DEFAULT_COVER = "/music/cover-placeholder.svg";

function normalizeLocalSong(song: any, index: number) {
  return {
    id: song.id || `local-${index}-${Date.now()}`,
    title: song.title || song.name || "未知歌曲",
    artist: song.artist || song.author || "未知歌手",
    cover: song.cover || song.pic || DEFAULT_COVER,
    src: song.src || song.url || "",
    lrcUrl: song.lrc || song.lrcUrl || null,
    lrc: null,
    lyrics: Array.isArray(song.lyrics) ? song.lyrics : [],
  };
}

async function fetchBackendPlaylist() {
  try {
    const configRes = await fetch(`/backend_config.json?t=${Date.now()}`);
    if (!configRes.ok) return null;
    const configData = await configRes.json();
    if (!configData?.api_port) return null;

    const res = await fetch(
      `http://127.0.0.1:${configData.api_port}/api/music/list`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data)
      ? data
      : data?.data ?? data?.songs ?? data?.playlist;
    return Array.isArray(list) ? list : null;
  } catch {
    return null;
  }
}

// 🌟 1. 扩充 Context 类型，加入 MusicPage 需要的所有属性
type PlayMode = 'loop' | 'single' | 'random';

interface MusicContextType {
  playlist: any[];
  currentIndex: number;
  currentSong: any; // 扩展了 lyrics 属性
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  selectSong?: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("正在连接高可用神经云端...");
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 2. 新增音量和播放模式状态
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('loop');

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let isMounted = true;

    const initPlaylist = async () => {
      let source: any[] | null = null;

      // 生产模式优先从后端拉最新歌单，本地模式直接读静态配置
      const isLocalPreview = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (process.env.NODE_ENV === "production" && isLocalPreview) {
        source = await fetchBackendPlaylist();
      }

      if (!source || source.length === 0) {
        const local = (siteConfig as any).localMusic;
        source = Array.isArray(local) ? local : [];
      }

      if (!isMounted) return;

      const normalized = (source || []).map(normalizeLocalSong);
      if (normalized.length > 0) {
        setPlaylist(normalized);
      } else {
        setCurrentLyric("暂无本地音乐");
      }
      setIsLoading(false);
    };

    initPlaylist();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (playlist.length === 0) return;
    let isMounted = true;
    const currentSong = playlist[currentIndex];
    setLyrics([]);
    setCurrentLyric("♪ 正在缓冲 ♪");
    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
      if (isMounted) {
        setLyrics(currentSong.lyrics);
        setCurrentLyric(currentSong.lyrics[0]?.text || "\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a");
      }
    } else if (currentSong.lrcUrl) {
      fetch(currentSong.lrcUrl)
        .then(res => res.text())
        .then(text => {
          if (isMounted) {
             const parsed = parseLrc(text);
             setLyrics(parsed);
             setPlaylist(prev => {
                const newPlaylist = [...prev];
                newPlaylist[currentIndex].lyrics = parsed;
                return newPlaylist;
             });
          }
        })
        .catch(() => { if (isMounted) setCurrentLyric("\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a"); });
    }

    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
    return () => { isMounted = false; };
  }, [currentIndex, playlist.length]); // 移除 playlist 依赖防止无限循环，只依赖长度

  // 🌟 4. 同步音量到 audio 元素
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(!isPlaying);
    }
  };

  // 🌟 5. 重写 nextSong，加入对随机模式的处理
  const nextSong = () => {
    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevSong = () => {
    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  // 🌟 6. 暴露直接播放指定歌曲的方法
  const playSong = (index: number) => {
    setCurrentIndex(index);
    if (!isPlaying) setIsPlaying(true); // 保证切歌后自动播放
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setCurrentTime(currentTime);
      setDuration(duration || 0);
      setProgress((currentTime / (duration || 1)) * 100);

      if (lyrics.length > 0) {
        const activeLyric = lyrics.slice().reverse().find(l => currentTime >= l.time);
        if (activeLyric && activeLyric.text !== currentLyric) {
          setCurrentLyric(activeLyric.text);
        }
      }
    }
  };

  // 🌟 7. 处理歌曲结束
  const handleEnded = () => {
    if (playMode === 'single' && audioRef.current) {
       audioRef.current.currentTime = 0;
       audioRef.current.play();
    } else {
       nextSong();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    setPlayMode(prev => {
      if (prev === 'loop') return 'single';
      if (prev === 'single') return 'random';
      return 'loop';
    });
  };

  const currentSong = playlist[currentIndex];

  return (
    <MusicContext.Provider value={{
        playlist, currentIndex, currentSong, isPlaying, progress, currentTime, duration, currentLyric, isLoading,
        volume, isMuted, playMode, // 暴露新状态
        togglePlay, nextSong, prevSong, handleSeek,
        playSong, setVolume, toggleMute, togglePlayMode // 暴露新方法
    }}>
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded} // 使用我们重写的结束处理
          onLoadedMetadata={handleTimeUpdate}
        />
      )}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};
