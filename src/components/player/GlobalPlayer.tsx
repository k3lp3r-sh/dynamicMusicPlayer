"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Track {
  uri: string;
  title: string;
  subtitle: string;
  duration: number;
}

interface GlobalPlayerProps {
  spotifyId: string | null;
  playlistName?: string;
  coverImage?: string;
  onClose: () => void;
}

// Utility to cleanly shuffle a playlist array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Smart continuous shuffle avoiding repeats on bounds
function safeShuffleArray<T extends { uri: string }>(array: T[], previousLastItem: T | null): T[] {
  const shuffled = shuffleArray(array);
  if (previousLastItem && shuffled.length > 1 && shuffled[0].uri === previousLastItem.uri) {
     [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export default function GlobalPlayer({
  spotifyId,
  playlistName,
  coverImage,
  onClose,
}: GlobalPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [prevPos, setPrevPos] = useState(0);

  // Queue State
  const [rawTracks, setRawTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const skipDebounceRef = useRef<boolean>(false);
  const IFrameApiRef = useRef<any>(null);

  const activeTrack = queue[queueIndex] || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch & Shuffle Tracklist (Or Restore from Memory)
  useEffect(() => {
    if (!spotifyId) {
      setQueue([]);
      setRawTracks([]);
      setShowQueue(false);
      return;
    }

    let isSubscribed = true;
    setIsLoadingTracks(true);

    const initializeQueue = async () => {
      try {
        const savedQueueData = localStorage.getItem(`truffles_queue_v2_${spotifyId}`);
        if (savedQueueData) {
          const parsed = JSON.parse(savedQueueData);
          if (parsed && parsed.queue && parsed.queue.length > 0) {
            if (isSubscribed) {
              setRawTracks(parsed.rawTracks || parsed.queue);
              setQueue(parsed.queue);
              setQueueIndex(parsed.queueIndex || 0);
              setIsLoadingTracks(false);
              return;
            }
          }
        }

        const res = await fetch(`/api/playlists/${spotifyId}/tracks`);
        if (!res.ok) throw new Error("Failed to fetch tracks");
        const data = await res.json();

        if (isSubscribed && data.tracks && data.tracks.length > 0) {
          const tracks = data.tracks as Track[];
          setRawTracks(tracks);
          const shuffled = shuffleArray(tracks);
          setQueue(shuffled);
          setQueueIndex(0);
        }
      } catch (err) {
        console.error("Phantom Queue Error:", err);
      } finally {
        if (isSubscribed) setIsLoadingTracks(false);
      }
    };

    initializeQueue();

    return () => {
      isSubscribed = false;
    };
  }, [spotifyId]);

  // Active Memory Snapshot
  useEffect(() => {
    if (spotifyId && queue.length > 0) {
      localStorage.setItem(`truffles_queue_v2_${spotifyId}`, JSON.stringify({
        rawTracks,
        queue,
        queueIndex,
        timestamp: Date.now()
      }));
    }
  }, [spotifyId, queue, queueIndex, rawTracks]);

  // 2. Load API Helper
  const loadSpotifyApi = useCallback((): Promise<any> => {
    return new Promise<any>((resolve) => {
      const win = window as any;
      if (win.SpotifyIframeApi) {
        resolve(win.SpotifyIframeApi);
      } else {
        const script = document.createElement("script");
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);

        win.onSpotifyIframeApiReady = (IFrameAPI: any) => {
          win.SpotifyIframeApi = IFrameAPI;
          resolve(IFrameAPI);
        };
      }
    });
  }, []);

  // 3. Mount and Load specific track URI to the phantom iframe
  useEffect(() => {
    if (!activeTrack) return;

    let isSubscribed = true;

    const initTrack = async () => {
      const IFrameAPI: any = await loadSpotifyApi();
      if (!isSubscribed) return;
      IFrameApiRef.current = IFrameAPI;

      // Reset playback UI states for new track
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setPrevPos(0);

      // Re-use controller if exists
      if (controllerRef.current) {
        controllerRef.current.loadUri(activeTrack.uri);
        // Small delay for load initialization
        setTimeout(() => {
          if (controllerRef.current && isSubscribed) {
            controllerRef.current.play();
          }
        }, 1500);
        return;
      }

      // Initial Create Controller
      if (!iframeContainerRef.current) return;
      iframeContainerRef.current.innerHTML = '<div id="spotify-iframe"></div>';
      const element = document.getElementById("spotify-iframe");
      if (!element) return;

      const options = {
        uri: activeTrack.uri,
        width: "100%",
        height: "152",
        theme: "0",
      };

      const callback = (EmbedController: any) => {
        if (!isSubscribed) return;
        controllerRef.current = EmbedController;

        EmbedController.addListener("playback_update", (e: any) => {
          if (skipDebounceRef.current) return;
          setIsPlaying(!e.data.isPaused);
          setPosition(e.data.position);
          setDuration(e.data.duration);
        });

        setTimeout(() => {
          if (controllerRef.current && isSubscribed) controllerRef.current.play();
        }, 800);
      };

      IFrameAPI.createController(element, options, callback);
    };

    initTrack();

    return () => {
      isSubscribed = false;
    };
  }, [activeTrack, loadSpotifyApi]);

  // Clean up global controller strictly on complete component dismount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []);

  const handleNextTrack = useCallback(() => {
    if (!queue.length || !rawTracks.length) return;
    
    // Lock skips during transition
    skipDebounceRef.current = true;
    setTimeout(() => { skipDebounceRef.current = false; }, 2500);

    setPrevPos(0);
    setPosition(0);
    setIsPlaying(false);

    if (queueIndex === queue.length - 1) {
      // Endless smart mode: Create perfectly fresh queue that won't replay current activeTrack immediately 
      const freshQueue = safeShuffleArray(rawTracks, queue[queue.length - 1]);
      setQueue(freshQueue);
      setQueueIndex(0);
    } else {
      setQueueIndex((prev) => prev + 1);
    }
  }, [queue, queueIndex, rawTracks]);

  const handlePrevTrack = useCallback(() => {
    if (!queue.length) return;
    if (queueIndex === 0) {
       // Reset position of current track instead if at beginning
       if (controllerRef.current) controllerRef.current.seek(0);
       return;
    }
    
    // Lock skips during transition
    skipDebounceRef.current = true;
    setTimeout(() => { skipDebounceRef.current = false; }, 2500);

    setPrevPos(0);
    setPosition(0);
    setIsPlaying(false);
    setQueueIndex((prev) => prev - 1);
  }, [queue, queueIndex]);

  // 4. Robust Track Completion Analytics
  useEffect(() => {
    if (position > prevPos) {
      setPrevPos(position);
    }
  }, [position, prevPos]);

  useEffect(() => {
    // Condition A: Natural scrub reached end
    const naturalEndTrigger = duration > 0 && position >= duration - 800 && duration !== position;
    // Condition B: The Iframe api forcefully stopped/resets to 0 upon reaching track end
    const forcedResetTrigger = duration > 0 && prevPos >= duration - 2500 && !isPlaying && position < 1000;

    if ((naturalEndTrigger || forcedResetTrigger) && !skipDebounceRef.current) {
      handleNextTrack();
    }
  }, [position, isPlaying, duration, prevPos, handleNextTrack]);


  const togglePlay = () => {
    if (controllerRef.current) {
      controllerRef.current.togglePlay();
    }
  };

  if (!mounted) return null;

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const formatTime = (ms: number) => {
    if (!ms || ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const upcomingTracks = queue.slice(queueIndex + 1, queueIndex + 11); // Show up to next 10

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        spotifyId ? "translate-y-0" : "translate-y-[120%]"
      }`}
    >
      {/* Hidden Phantom Engine */}
      <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden -z-10 bg-black">
        <div ref={iframeContainerRef} />
      </div>

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 mb-6">
        {/* Up Next Drawer */}
        <div 
          className={`w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-surface-elevated/95 backdrop-blur-xl border border-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-t-[2rem] -mb-8 pb-8 flex flex-col ${
             showQueue ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
           <div className="p-6 overflow-y-auto carousel-scroll flex-1">
              <h3 className="font-display font-medium text-text-primary text-[14px] uppercase tracking-widest opacity-80 mb-4 sticky top-0 bg-surface-elevated/95 backdrop-blur-xl py-2 z-10 border-b border-border">
                  Up Next {upcomingTracks.length > 0 && `(${upcomingTracks.length})`}
              </h3>
              {upcomingTracks.length === 0 ? (
                 <p className="text-sm text-text-muted">End of queue. A fresh shuffle will generate automatically.</p>
              ) : (
                 <div className="flex flex-col gap-3">
                   {upcomingTracks.map((track, i) => (
                      <div key={`${track.uri}-${i}`} className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                         <div className="w-6 font-mono text-[11px] text-text-muted">{i + 1}</div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-text-primary truncate">{track.title}</p>
                            <p className="text-[11px] text-text-muted truncate">{track.subtitle}</p>
                         </div>
                         <div className="text-[11px] text-text-muted font-mono">{formatTime(track.duration)}</div>
                      </div>
                   ))}
                 </div>
              )}
           </div>
        </div>

        {/* Main Dock */}
        <div className="relative overflow-hidden rounded-[2rem] bg-surface-elevated/95 backdrop-blur-xl border border-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-4 flex flex-col items-center gap-4 z-20 group">
          
          {/* External Floating Close Button (Mobile safe, no collision) */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-surface shadow-md border border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors z-[60]"
            aria-label="Close Player"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Custom Player UI */}
          <div className="w-full flex items-center gap-3 sm:gap-4 relative z-10">
            {/* Album Cover */}
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border shadow-lg bg-surface">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
              {isLoadingTracks ? (
                <div className="h-4 w-32 bg-border animate-pulse rounded mb-2" />
              ) : (
                <h4 className="font-display font-medium text-text-primary truncate text-[15px] sm:text-[16px] tracking-wide flex items-center gap-2">
                  {activeTrack ? activeTrack.title : playlistName}
                  {isPlaying && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                  )}
                </h4>
              )}
              
              {!isLoadingTracks && activeTrack?.subtitle && (
                <p className="text-[12px] text-text-muted truncate mt-0.5">
                  {activeTrack.subtitle}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 mr-1 sm:mr-0">
              
              {/* Queue Button */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-colors ${showQueue ? 'bg-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                aria-label="Toggle Queue"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="8" y1="6" x2="21" y2="6"></line>
                   <line x1="8" y1="12" x2="21" y2="12"></line>
                   <line x1="8" y1="18" x2="21" y2="18"></line>
                   <line x1="3" y1="6" x2="3.01" y2="6"></line>
                   <line x1="3" y1="12" x2="3.01" y2="12"></line>
                   <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>

              {/* Prev Button */}
              <button
                onClick={handlePrevTrack}
                disabled={!queue.length}
                className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Previous Track"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6l-8.5 6 8.5 6V6zm-10 0v12h2V6H8z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(37,144,146,0.4)]"
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                )}
              </button>
              
              {/* Next Button */}
              <button
                onClick={handleNextTrack}
                disabled={!queue.length}
                className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Next Random Track"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Mobile Queue Button */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`sm:hidden flex w-9 h-9 rounded-full items-center justify-center transition-colors ${showQueue ? 'bg-border text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                aria-label="Toggle Queue"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="8" y1="6" x2="21" y2="6"></line>
                   <line x1="8" y1="12" x2="21" y2="12"></line>
                   <line x1="8" y1="18" x2="21" y2="18"></line>
                   <line x1="3" y1="6" x2="3.01" y2="6"></line>
                   <line x1="3" y1="12" x2="3.01" y2="12"></line>
                   <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>

            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full relative z-10 px-1">
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-[1000ms] ease-linear rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between w-full mt-1.5 px-0.5">
              <span className="text-[10px] text-text-muted font-mono tracking-wider">
                {formatTime(position)}
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-wider">
                {formatTime(activeTrack ? activeTrack.duration : duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
