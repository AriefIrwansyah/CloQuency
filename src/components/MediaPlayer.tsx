import React, { useState, useEffect, useRef } from "react";
import { BroadcastChannel } from "../types";
import { Play, Pause, Volume2, VolumeX, Radio, Tv, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Hls from "hls.js";

interface MediaPlayerProps {
  activeChannel: BroadcastChannel;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  streamMode: "audio" | "video";
  onStreamModeChange: (mode: "audio" | "video") => void;
}

export default function MediaPlayer({
  activeChannel,
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  streamMode,
  onStreamModeChange,
}: MediaPlayerProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [frequency, setFrequency] = useState<number>(0.25); // Simulated audio frequency modifier (treble/mid)
  const [showEq, setShowEq] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize and synchronise stream URL playing
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = activeChannel.streamUrl;
    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked or stream issue:", err);
      });
    } else {
      audioRef.current.pause();
    }

    // Modern Radio hosts sync: if stream changes or stream plays, jump to end (live buffer)
    if (isPlaying && audioRef.current) {
      const duration = audioRef.current.duration;
      if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) {
        audioRef.current.currentTime = Math.max(0, duration - 1);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeChannel.streamUrl]);

  // Synchronise volume adjustments
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Play/Pause actions
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio play error", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Synchronise HLS live video stream source and player binding
  useEffect(() => {
    let hlsInstance: Hls | null = null;
    const videoElement = videoRef.current;

    if (streamMode === "video" && activeChannel.videoType === "hls" && videoElement) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(activeChannel.videoUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch((err) => {
            console.warn("HLS play fail", err);
          });
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hlsInstance?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hlsInstance?.recoverMediaError();
                break;
              default:
                hlsInstance?.destroy();
                break;
            }
          }
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = activeChannel.videoUrl;
        videoElement.addEventListener("loadedmetadata", () => {
          videoElement.play().catch((err) => {
            console.warn("Native Safari HLS play fail", err);
          });
        });
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [activeChannel.videoUrl, activeChannel.videoType, streamMode]);

  // Beautiful synthetic custom wave visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      // Safely resize canvas to current client container
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Background grid subtle effect
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw horizontal baseline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Only animate if audio is actively playing
      const multiplier = isPlaying ? 1 : 0.05;
      phase += isPlaying ? (activeChannel.id === "e100" ? 0.12 : activeChannel.id === "mradio" ? 0.08 : 0.05) : 0.005;

      // Render layered custom audio waves
      const waveColor = activeChannel.id === "e100" 
        ? "rgba(34, 211, 238, " 
        : activeChannel.id === "mradio" 
        ? "rgba(251, 191, 36, " 
        : "rgba(217, 70, 239, ";

      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 3 : 1.5;
        ctx.strokeStyle = `${waveColor}${w === 0 ? "0.85" : w === 1 ? "0.4" : "0.15"})`;

        const wavePhase = phase + w * Math.PI * 0.45;
        const waveFrequency = 0.015 - w * 0.004;
        
        // Channel themed wave shapes
        const amplitude = (activeChannel.id === "e100" ? 38 : activeChannel.id === "mradio" ? 28 : 18) * multiplier * (1 - w * 0.2) * (0.8 + frequency * 0.4);

        for (let x = 0; x < width; x++) {
          let y = height / 2;

          // Introduce synthetic harmonic noise/shaping
          if (activeChannel.id === "e100") {
            // Square/sine hybrid electronic rhythm
            y += Math.sin(x * waveFrequency + wavePhase) * amplitude;
            if (isPlaying && x % 40 < 10) {
              y += Math.cos(x * 0.1) * 8 * multiplier;
            }
          } else if (activeChannel.id === "mradio") {
            // Rounded melodic acoustic sine
            y += Math.sin(x * waveFrequency + wavePhase) * amplitude;
            y += Math.sin(x * 0.04 - wavePhase * 0.5) * (amplitude * 0.25);
          } else {
            // Smooth slow sweeping ambient waves
            y += Math.sin(x * (waveFrequency * 0.8) + wavePhase * 0.3) * amplitude;
            y += Math.cos(x * 0.005 + wavePhase * 0.8) * (amplitude * 0.4);
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Live pulse nodes on active waves
      if (isPlaying && Math.random() > 0.6) {
        ctx.fillStyle = activeChannel.id === "e100" ? "#22d3ee" : activeChannel.id === "mradio" ? "#fbbf24" : "#d946ef";
        ctx.beginPath();
        const randX = Math.random() * width;
        const randY = height / 2 + Math.sin(randX * 0.01 + phase) * 20;
        ctx.arc(randX, randY, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeChannel, isPlaying, frequency]);

  const handleSliderReveal = () => {
    setShowVolumeSlider(prev => !prev);
  };

  return (
    <div id="media-player-container" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background neon vibe color depending on current channel */}
      <div className={`absolute top-0 right-0 w-80 h-32 blur-[100px] transition-all duration-700 pointer-events-none opacity-20 ${
        activeChannel.id === "e100" ? "bg-cyan-500" : activeChannel.id === "mradio" ? "bg-amber-500" : "bg-fuchsia-500"
      }`} />

      {/* Top Details & Stream Mode Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#232736]/60 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
              activeChannel.id === "e100" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800"
                : activeChannel.id === "mradio"
                ? "bg-amber-500/10 text-amber-400 border border-amber-800"
                : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-800"
            }`}>
              📻
            </div>
            {/* Pulsing indicator */}
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#11131c] ${
              isPlaying ? "animate-pulse" : ""
            } ${
              activeChannel.id === "e100" ? "bg-cyan-400" : activeChannel.id === "mradio" ? "bg-amber-400" : "bg-fuchsia-400"
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-semibold text-white tracking-tight text-base leading-snug">{activeChannel.name}</h3>
              <span className="font-mono text-[10px] bg-[#1a1e2f] border border-[#2c324b] text-gray-400 px-1.5 py-0.5 rounded uppercase">
                {activeChannel.frequency}
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 mt-0.5">{activeChannel.genre}</p>
          </div>
        </div>

        {/* Audio / Video Switcher */}
        <div id="stream-mode-selectors" className="flex items-center gap-1.5 bg-[#181a26] border border-[#232736] p-1 rounded-xl w-full sm:w-auto justify-center sm:justify-start">
          <button
            id="audio-mode-btn"
            onClick={() => onStreamModeChange("audio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              streamMode === "audio"
                ? "bg-[#252a3f] text-white shadow-sm border border-[#3b4363]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2f]"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Audio Only
          </button>
          <button
            id="video-mode-btn"
            onClick={() => onStreamModeChange("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
              streamMode === "video"
                ? "bg-[#252a3f] text-white shadow-sm border border-[#3b4363]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2f]"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Live Video Studio
          </button>
        </div>
      </div>

      {/* Screen / Visualizer Box */}
      <div className="w-full h-52 sm:h-64 rounded-xl border border-[#232736] bg-[#0c0e14] relative overflow-hidden flex items-center justify-center shadow-inner group">
        {streamMode === "audio" ? (
          /* Live Canvas Audio Wave */
          <div className="relative w-full h-full flex flex-col justify-between">
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-0 cursor-pointer" />
            
            {/* Visual HUD overlays */}
            <div className="flex justify-between items-center p-3 relative z-10 bg-gradient-to-b from-[#0c0e14]/90 to-transparent pointer-events-none">
              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isPlaying ? 'animate-ping' : ''}`} />
                {isPlaying ? "BUFFER SYNCED // LIVE_EDGE" : "STREAM PAUSED"}
              </span>
              <span className="font-mono text-[10px] text-gray-500 uppercase">
                LATENCY: {isPlaying ? "0.2s" : "--"}
              </span>
            </div>

            {/* Freq Modifier Overlay Controls */}
            <div className="absolute right-3 top-12 z-20 flex flex-col items-center gap-2 bg-[#141622]/90 border border-[#232736] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setShowEq(prev => !prev)}
                className={`p-1.5 rounded hover:bg-[#252a3f] text-slate-300`}
                title="EQ Simulator"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              {showEq && (
                <div className="flex flex-col items-center gap-1 mt-1">
                  <span className="font-mono text-[8px] text-slate-500">EQ</span>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={frequency}
                    onChange={(e) => setFrequency(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-[#232736] accent-cyan-500 rounded-lg appearance-none cursor-pointer transform -rotate-90 origin-center my-3"
                  />
                  <span className="font-mono text-[8px] text-slate-400">{Math.round(frequency * 100)}%</span>
                </div>
              )}
            </div>

            {/* Nice centered play button helper if paused */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  id="canvas-play-hero"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={onTogglePlay}
                  className="absolute z-10 self-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:scale-105 hover:bg-slate-800 transition active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current ml-0.5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Bottom HUD metadata overlay */}
            <div className="p-3 relative z-10 bg-gradient-to-t from-[#0c0e14]/90 to-transparent flex justify-between items-end pointer-events-none">
              <div className="font-mono text-[9px] text-slate-400">
                <p>BITRATE: 128KBPS MP3</p>
                <p className="text-slate-500">FORMAT: ICECAST DIRECT STREAM</p>
              </div>
              <p className="font-mono text-[10px] text-slate-400 bg-[#161924]/60 px-2 py-0.5 rounded border border-[#272c3d]/60">
                {activeChannel.frequency}
              </p>
            </div>
          </div>
        ) : (
          /* Live Video Stream Camera - Custom Simulated Visual Studio Camera Feed, Twitch or Lofi Youtube Video */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {activeChannel.videoType === "hls" ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-90"
                controls={true}
                muted={true}
                playsInline={true}
                autoPlay={true}
              />
            ) : activeChannel.videoType === "twitch" ? (
              <iframe
                className="w-full h-full border-none opacity-90"
                src={`https://player.twitch.tv/?channel=${activeChannel.videoUrl}&parent=${window.location.hostname || "localhost"}&parent=localhost&parent=127.0.0.1&parent=ais-dev-tif2z3akc5paldvhfv4qgm-257162911554.asia-southeast1.run.app&muted=true&autoplay=true`}
                title="Twitch Player"
                allowFullScreen={true}
                scrolling="no"
              />
            ) : (
              <iframe 
                className="w-full h-full pointer-events-none select-none opacity-80"
                src={activeChannel.videoUrl}
                title="Studio Camera Live"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen={true}
              />
            )}
            {/* Simulated Live Cam Stamp Overlays */}
            <div className="absolute top-3 left-3 bg-[#f43f5e] text-white px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest rounded flex items-center gap-1.5 animate-pulse select-none z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE FEED // {activeChannel.videoType?.toUpperCase() || "CAM 01"}
            </div>
            
            <div className="absolute bottom-3 left-3 font-mono text-[9px] text-[#22d3ee]/90 bg-slate-950/75 p-1 px-1.5 rounded select-none border border-[#232736] z-10">
              STUDIO: {activeChannel.name.toUpperCase()} // LIVE
            </div>

            <div className="absolute top-3 right-3 font-mono text-[9px] text-[#fbbf24] bg-slate-950/75 p-1 px-1.5 rounded select-none border border-[#232736] z-10">
              FPS: 60 // SYNCED
            </div>
          </div>
        )}
      </div>

      {/* Media Player Control Dashboard */}
      <div className="flex items-center justify-between mt-4 gap-4 relative z-10">
        {/* Toggle Playback Button */}
        <button
          id="btn-play-pause"
          onClick={onTogglePlay}
          className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition shadow-md active:scale-95 ${
            isPlaying
              ? "bg-[#2c324b] hover:bg-[#343b59] border border-[#40496e] text-white"
              : activeChannel.id === "e100"
              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
              : activeChannel.id === "mradio"
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
              : "bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 shadow-fuchsia-500/20"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Dynamic Station Tuning Info */}
        <div className="flex-1 text-center hidden min-[440px]:block">
          <p className="font-mono text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
            {isPlaying ? "PLAYING AUDIO RETRIEVAL LOOP" : "BROADCAST STANDBY"}
          </p>
          <p className="font-sans text-[11px] font-medium text-slate-300 mt-0.5 line-clamp-1 italic">
            "{activeChannel.description}"
          </p>
        </div>

        {/* Volume Controller Module with sliders */}
        <div className="flex items-center gap-2 relative">
          <button
            id="volume-panel-toggle"
            onClick={handleSliderReveal}
            className="p-2.5 rounded-full bg-[#181a26] border border-[#232736] text-slate-400 hover:text-white hover:bg-[#202434] transition active:scale-95 cursor-pointer"
            title="Volume Controls"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                className="absolute right-12 z-30 flex items-center gap-2 bg-[#181a26] border border-[#232736] p-2 py-1.5 rounded-xl shadow-lg"
              >
                <button
                  onClick={onToggleMute}
                  className="p-1 rounded hover:bg-[#252a3f]"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    onVolumeChange(parseFloat(e.target.value));
                    if (isMuted) onToggleMute();
                  }}
                  className="w-20 sm:w-24 h-1.5 bg-[#252a3f] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="font-mono text-[9px] text-slate-400 min-w-7 text-right">
                  {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
