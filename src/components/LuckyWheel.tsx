import React, { useState, useEffect, useRef } from "react";
import { LuckyWheelItem, UserProfile } from "../types";
import { Sparkles, Volume2, VolumeX, ShieldAlert, Award, Power, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LuckyWheelProps {
  channelId: string;
  currentUser: UserProfile | null;
  items: LuckyWheelItem[];
  onSpinStart?: () => void;
  onSpinEnd?: (winnerItem: LuckyWheelItem, winnerName: string) => void;
  accentColorClass: string;
}

export default function LuckyWheel({
  channelId,
  currentUser,
  items,
  onSpinStart,
  onSpinEnd,
  accentColorClass,
}: LuckyWheelProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<{ item: LuckyWheelItem; name: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);

  // Synchronise state variables safely for the animation draw frame
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  // Generate Web Audio API custom physical ticking plucks
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignored if browser policy mandates gesture
    }
  };

  // Convert prize index coordinates to radian angles
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (items.length === 0) {
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add items to wheel", centerX, centerY);
      return;
    }

    const arc = (Math.PI * 2) / items.length;
    const currentRot = rotationRef.current;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRot);

    // Draw Slices
    items.forEach((item, index) => {
      const angle = index * arc;
      
      // Draw sector wedge
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fill();

      // Divider Lines
      ctx.strokeStyle = "rgba(17, 19, 28, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Labels Text Draw
      ctx.save();
      ctx.fillStyle = "#ffffff";
      // Handle contrast dynamically if background colors are very bright
      if (item.color === "#FFD700" || item.color === "#7FFF00") {
        ctx.fillStyle = "#0c0e14";
      }
      ctx.textAlign = "right";
      ctx.font = "bold 10px sans-serif";
      ctx.translate(0, 0);
      ctx.rotate(angle + arc / 2);
      
      // Draw truncated text to fit nice in wheel
      const text = item.text.length > 18 ? item.text.substring(0, 16) + ".." : item.text;
      ctx.fillText(text, radius - 20, 4);
      ctx.restore();
    });

    ctx.restore();

    // Outter metallic shiny rings
    ctx.strokeStyle = "#2e354f";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#1b1d28";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Center premium peg node
    ctx.fillStyle = "#1e2235";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3e476e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", centerX, centerY);
  };

  // Re-draw wheel on state transformations
  useEffect(() => {
    drawWheel();
  }, [items, rotation]);

  // Simulated live spin calculation
  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;

    if (onSpinStart) {
      onSpinStart();
    }

    setIsSpinning(true);
    setShowCelebration(false);
    setWinner(null);

    // Speed constants
    const spinDuration = 4500; // 4.5 seconds spin
    const targetSpeed = 15 + Math.random() * 15; // Starting rapid speed
    const startRot = rotation;
    let currentRot = rotation;
    let lastTickAngle = 0;
    const arc = (Math.PI * 2) / items.length;

    const startTime = performance.now();

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Decelerating rotation interpolation curve (Quintic out)
      const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
      const easeProgress = easeOutQuint(progress);

      const deltaAngle = easeProgress * (Math.PI * 2 * 6 + targetSpeed);
      currentRot = startRot + deltaAngle;
      setRotation(currentRot % (Math.PI * 2));

      // Play click ticking sounds when crossing item slice borders
      const spinTickThreshold = Math.floor(currentRot / arc);
      if (spinTickThreshold !== lastTickAngle) {
        playTickSound();
        lastTickAngle = spinTickThreshold;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin finished: Compute winner
        setIsSpinning(false);

        // Standard rotational landing computing:
        // Angle points pointer: indicator is static at top (0 radians points right at 3 o'clock).
        // Standard index selector lands relative to top pointer point (indicator at 12 o'clock, which is -Math.PI / 2)
        const normalizeAngle = (currentRot + Math.PI / 2) % (Math.PI * 2);
        // Find which index matches this angle sector
        const sectorSize = (Math.PI * 2) / items.length;
        let winningIndex = items.length - 1 - Math.floor(normalizeAngle / sectorSize);
        if (winningIndex < 0) winningIndex = 0;
        if (winningIndex >= items.length) winningIndex = items.length - 1;

        const winnerItem = items[winningIndex];

        // Pick a Winner Listener: user or artificial bot
        const candidateWinners = [
          "DJ_WaveRider",
          "BeatBlaster99",
          "SynthDreamer",
          "AcousticSoul",
          "ChilledOutCat",
          "FrequencyFlyer",
          "SignalBreaker",
          "VolumeMax",
          "BassCatcher"
        ];
        if (currentUser) {
          candidateWinners.push(currentUser.username);
        }
        const wonUser = candidateWinners[Math.floor(Math.random() * candidateWinners.length)];

        setWinner({ item: winnerItem, name: wonUser });
        setShowCelebration(true);

        // Vocalise announcements via native SpeechSynthesis
        if (soundEnabled) {
          try {
            const vocalPrefix = `Congratulations to ${wonUser}! You won ${winnerItem.text}!`;
            const utterance = new SpeechSynthesisUtterance(vocalPrefix);
            window.speechSynthesis.speak(utterance);
          } catch {
            // Ignored if browser terms block speak
          }
        }

        if (onSpinEnd) {
          onSpinEnd(winnerItem, wonUser);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const isBroadcaster = currentUser?.isAdmin;

  return (
    <div id="giveaway-wheel-panel" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#232736]/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="font-sans font-semibold text-sm text-white tracking-tight">Lucky Broadcaster Wheel</h4>
        </div>
        
        {/* Sound toggle switches */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-[#232736]/40 cursor-pointer text-[10px] uppercase font-mono ${
            soundEnabled ? "text-amber-400" : "text-gray-500"
          }`}
          title="Toggle vocal and ticking sound effects"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? "Sound ON" : "Muted"}</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Static Pointer arrow at the top center */}
        <div className="absolute top-[2px] z-20 flex flex-col items-center select-none pointer-events-none">
          <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[14px] border-t-red-500 filter drop-shadow-md" />
          <div className="w-2.5 h-2.5 bg-red-400 rounded-full border border-red-600 -mt-1.5" />
        </div>

        {/* Wheel Drawing Canvas viewport */}
        <div className="relative p-2 rounded-full border border-slate-700/20 bg-slate-950/40 shadow-inner">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="w-56 h-56 sm:w-60 sm:h-60 rounded-full shadow-lg relative z-0"
          />
        </div>

        {/* Spin trigger panel */}
        <div className="mt-5 w-full text-center relative z-10">
          {isBroadcaster ? (
            <div className="space-y-2">
              <button
                id="btn-trigger-spin"
                disabled={isSpinning || items.length === 0}
                onClick={spinWheel}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-400 hover:from-amber-400 hover:to-amber-500 text-xs font-sans font-bold py-2.5 px-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 fill-current" />
                {isSpinning ? "SPINNING GIVEAWAY OVER WIRES..." : "LAUNCH GIVEAWAY SPIN"}
              </button>
              <p className="font-mono text-[9px] text-amber-500/80 uppercase">
                ⚡ YOU HAVE BROADCASTER PRIVILEGES TO SPIN
              </p>
            </div>
          ) : (
            <div className="bg-[#181a26]/80 p-3 rounded-xl border border-[#232736]/60">
              <div className="flex items-center justify-center gap-2 text-indigo-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span className="font-sans font-medium text-xs text-left">Broadcaster Stream Sync Active</span>
              </div>
              <p className="font-sans text-[10px] text-slate-400 mt-1">
                Only radio hosts can spin the wheel. Watch in real-time or simulate in Demo Mode.
              </p>
              
              {/* Client Demo Helper: allowed listener simulator */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || items.length === 0}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 bg-[#1f2334] border border-[#2b3149] hover:bg-[#272c42] text-slate-300 text-[10px] font-sans font-semibold py-1.5 px-3 rounded-lg active:scale-95 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSpinning ? "animate-spin" : ""}`} />
                Test Simulation Spin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confetti celebration popup overlay */}
      <AnimatePresence>
        {showCelebration && winner && (
          <WinnerModal
            winner={winner}
            onClose={() => {
              setShowCelebration(false);
              setWinner(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Modal layout rendering particle effects canvas */
interface WinnerModalProps {
  winner: { item: LuckyWheelItem; name: string };
  onClose: () => void;
}

function WinnerModal({ winner, onClose }: WinnerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles representation
    interface Particle {
      x: number;
      y: number;
      color: string;
      radius: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = ["#ff3e6c", "#1e90ff", "#2ed573", "#ffa502", "#eccc68", "#ff4757", "#c56cf0"];

    // Populate particles
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height, // Spawn above screen
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 6 + 3,
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 4,
        rotation: Math.random() * Math.PI,
        rotationSpeed: Math.random() * 0.05 - 0.025,
      });
    }

    let animId: number;
    const run = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        
        // Draw little squares or rectangles representing confetti shreds
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
        ctx.restore();

        // Recycle particles at bottom border
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(run);
    };

    run();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div id="full-winner-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      {/* Absolute floating canvas particles background */}
      <canvas ref={canvasRef} className="absolute inset-0 select-none pointer-events-none z-0" />

      {/* Modal Dialog container with motion layout animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 15 }}
        className="bg-[#151826] border-2 border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Glow backdrop decorative layout circle */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss trigger */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252a3f] active:scale-95 border border-transparent hover:border-[#303856]/60 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          {/* Winner Trophy badge icon */}
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <span className="font-mono text-[10px] tracking-widest text-[#22d3ee] uppercase font-bold bg-[#14232c] px-3 py-1 border border-[#22d3ee]/20 rounded-full">
            🎈 PRIZE WHEEL LANDING
          </span>

          <h2 className="font-sans font-bold text-lg text-white mt-4">
            Congratulations
          </h2>
          <h1 className="font-sans font-extrabold text-2xl text-amber-400 mt-1 tracking-tight truncate max-w-full">
            {winner.name}
          </h1>

          <div className="bg-slate-950/60 border border-[#232736]/70 p-4.5 rounded-xl mt-5 w-full">
            <p className="font-sans text-[11px] text-slate-400 uppercase tracking-widest">Won the Giveaway Item:</p>
            <p className="font-sans text-lg font-bold text-white mt-1.5 flex items-center justify-center gap-2">
              <span>{winner.item.text}</span>
            </p>
          </div>

          <p className="font-sans text-xs text-[#22d3ee] mt-4 flex items-center justify-center gap-1">
            <Sparkles className="w-4.5 h-4.5 text-inherit" />
            Broadcaster is updating stream prize ledger...
          </p>

          <button
            onClick={onClose}
            className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 hover:opacity-90 text-slate-950 font-sans font-semibold text-xs active:scale-95 transition cursor-pointer"
          >
            Claim & Return to Station
          </button>
        </div>
      </motion.div>
    </div>
  );
}
