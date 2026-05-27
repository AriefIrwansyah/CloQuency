import React, { useState } from "react";
import { LuckyWheelItem, LivePoll } from "../types";
import { Settings, Plus, Trash2, ArrowUpRight, Ban, Zap, Disc, LayoutGrid, Volume1, Volume2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  channelId: string;
  wheelItems: LuckyWheelItem[];
  onAddWheelItem: (text: string) => void;
  onRemoveWheelItem: (id: string) => void;
  onStartPoll: (question: string, options: string[], duration: number) => void;
  onEndPoll: () => void;
  activePoll: LivePoll | null;
  onTriggerSpin: () => void;
  isSpinning: boolean;
  accentColorClass: string;
}

const PRESET_POLLS = [
  {
    category: "EDM Track Request",
    question: "Which electronic classic anthem track gets spun next?",
    options: ["Armin Van Buuren - Shivers 🌀", "Tiësto - Adagio For Strings 🎹", "Deadmau5 - Strobe 🐭", "Daft Punk - One More Time 🎧"],
    duration: 60
  },
  {
    category: "Acoustic / Folk Session",
    question: "Select the artist block for Host Sophia's next live acoustic showcase:",
    options: ["Bon Iver Acoustic 🌲", "Phoebe Bridgers Covers 🎻", "Mumford & Sons Classics 🪕", "Boygenius Deep Cuts 🕯️"],
    duration: 90
  },
  {
    category: "Vibe / Energy Check",
    question: "Station check-in! Describe your listener energy density right now:",
    options: ["100% Fully Powered & Energized! ⚡", "Chilled, Cozy & Engaged ☕", "Dozing off/Dreamy focus 💤", "Rhythmic/Sub-bass dancing 🕺"],
    duration: 45
  },
  {
    category: "Trivia Contest",
    question: "Radio Trivia: In which decade was the FM radio broadcast standard patented?",
    options: ["1910s", "1930s (Edwin Armstrong) 📻", "1950s", "1975s Gold Era"],
    duration: 30
  }
];

const PRESET_WHEEL_COLORS = ["#FF1493", "#00BFFF", "#FF8C00", "#32CD32", "#9932CC", "#FFD700", "#1E90FF", "#FF4500"];

export default function AdminPanel({
  channelId,
  wheelItems,
  onAddWheelItem,
  onRemoveWheelItem,
  onStartPoll,
  onEndPoll,
  activePoll,
  onTriggerSpin,
  isSpinning,
  accentColorClass,
}: AdminPanelProps) {
  // Wheel State
  const [newPrizeText, setNewPrizeText] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_WHEEL_COLORS[0]);

  // Poll State
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState(60);

  // Knobs value simulation
  const [eqKnobValue, setEqKnobValue] = useState(68);
  const [gainKnobValue, setGainKnobValue] = useState(45);

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeText.trim()) return;
    onAddWheelItem(newPrizeText.trim() + ` [${selectedColor}]`);
    // Pass color inside brackets or extract it in the handler
    setNewPrizeText("");
    // Pick the next color from array for variance
    const nextColorIdx = (PRESET_WHEEL_COLORS.indexOf(selectedColor) + 1) % PRESET_WHEEL_COLORS.length;
    setSelectedColor(PRESET_WHEEL_COLORS[nextColorIdx]);
  };

  const handleStartCustomPoll = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (!pollQuestion.trim() || validOptions.length < 2) return;

    onStartPoll(pollQuestion.trim(), validOptions, pollDuration);
    // Reset inputs
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const addOptionField = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removeOptionField = (idx: number) => {
    if (pollOptions.length > 2) {
      const updated = pollOptions.filter((_, i) => i !== idx);
      setPollOptions(updated);
    }
  };

  const updateOptionValue = (idx: number, value: string) => {
    const updated = [...pollOptions];
    updated[idx] = value;
    setPollOptions(updated);
  };

  const applyPresetPoll = (preset: typeof PRESET_POLLS[0]) => {
    onStartPoll(preset.question, preset.options, preset.duration);
  };

  return (
    <div className="space-y-6">
      {/* Broadcaster Dial Console Simulation - Visual Craft */}
      <div className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#232736]/40 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-rose-500 animate-pulse" />
            <h4 className="font-sans font-bold text-sm text-slate-100">Studio Broadcast Console</h4>
          </div>
          <span className="font-mono text-[9px] bg-red-500/10 text-red-500 border border-red-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            Control Node
          </span>
        </div>

        {/* Console Knobs Grid */}
        <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-4 py-3 bg-[#0a0c13] rounded-xl border border-[#1b1d28] p-4 text-center">
          <div>
            <span className="font-mono text-[8px] text-slate-500 block">FM_GAIN</span>
            <div className="w-11 h-11 rounded-full border-2 border-slate-700 mx-auto mt-2 relative flex items-center justify-center cursor-pointer select-none bg-slate-900 shadow-inner hover:border-cyan-500 transition"
                 onClick={() => setGainKnobValue((prev) => (prev + 15) % 100)}>
              <div className="w-1 h-3.5 bg-cyan-400 absolute top-1 rounded" style={{ transform: `rotate(${(gainKnobValue / 100) * 360}deg)`, transformOrigin: "bottom center" }} />
            </div>
            <span className="font-mono text-[10px] text-cyan-400 mt-2 block font-semibold">{gainKnobValue}dB</span>
          </div>

          <div>
            <span className="font-mono text-[8px] text-slate-500 block">COMPRESSION</span>
            <div className="w-11 h-11 rounded-full border-2 border-slate-700 mx-auto mt-2 relative flex items-center justify-center cursor-pointer select-none bg-slate-900 shadow-inner hover:border-amber-500 transition"
                 onClick={() => setEqKnobValue((prev) => (prev + 10) % 100)}>
              <div className="w-1 h-3.5 bg-amber-400 absolute top-1 rounded" style={{ transform: `rotate(${(eqKnobValue / 100) * 360}deg)`, transformOrigin: "bottom center" }} />
            </div>
            <span className="font-mono text-[10px] text-amber-400 mt-2 block font-semibold">{eqKnobValue}%</span>
          </div>

          <div>
            <span className="font-mono text-[8px] text-slate-500 block">AUDIO PEAK</span>
            <div className="flex flex-col gap-0.5 mt-3 px-3">
              <div className="h-1 bg-emerald-500 rounded" />
              <div className="h-1 bg-emerald-500 rounded animate-pulse" />
              <div className="h-1 bg-amber-500 rounded" />
              <div className="h-1 bg-rose-500 rounded opacity-40" />
            </div>
            <span className="font-mono text-[9px] text-emerald-400 mt-2 block font-semibold">STABLE</span>
          </div>

          <div>
            <span className="font-mono text-[8px] text-slate-500 block">BROADCAST SWITCH</span>
            <div className="flex items-center justify-center mt-3">
              <span className="w-6 h-6 rounded-full bg-red-600 border border-red-400/50 shadow-lg shadow-red-500/20 flex items-center justify-center font-bold text-[8px] text-white">ON</span>
            </div>
            <span className="font-mono text-[9px] text-slate-400 mt-1.5 block">AI_STUDIO_B</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lucky Wheel Management */}
        <div id="admin-wheel-manager" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#232736]/40 pb-3 mb-4">
            <Disc className="w-4 h-4 text-cyan-400" />
            <h4 className="font-sans font-bold text-sm text-slate-100">Lucky Wheel Slices ({wheelItems.length})</h4>
          </div>

          {/* Add Item form */}
          <form onSubmit={handleAddPrize} className="space-y-3">
            <div className="flex flex-col min-[350px]:flex-row gap-2">
              <input
                type="text"
                placeholder="Prize Text (e.g. VIP Pass 🎫)"
                value={newPrizeText}
                onChange={(e) => setNewPrizeText(e.target.value)}
                maxLength={40}
                className="flex-1 bg-[#10121d] border border-[#232736] text-white py-2 px-3 rounded-xl text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              {/* Color selector bubble drops */}
              <div className="flex items-center gap-1 bg-[#10121d] border border-[#232736] p-1 px-2 rounded-xl">
                {PRESET_WHEEL_COLORS.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-4 h-4 rounded-full transition ${
                      selectedColor === c ? "ring-2 ring-white scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newPrizeText.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#171b2b] hover:bg-[#20273a] border border-[#2d334e] text-slate-300 py-2 px-4 rounded-xl text-xs font-sans font-bold active:scale-95 transition disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Slice Prize Selection
            </button>
          </form>

          {/* Slices list */}
          <div className="max-h-48 overflow-y-auto space-y-2 border border-[#232736]/50 bg-slate-950/20 rounded-xl p-2.5">
            {wheelItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-[#141624]/60 p-2 rounded-lg border border-[#222638]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-sans text-xs text-white truncate pr-1">{item.text}</span>
                </div>
                <button
                  onClick={() => onRemoveWheelItem(item.id)}
                  disabled={wheelItems.length <= 3}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800/40 rounded transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  title="Remove prize slice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Poll Construction */}
        <div id="admin-poll-manager" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#232736]/40 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-bold text-sm text-slate-100">Micro Poll Constructor</h4>
            </div>
            
            {activePoll && (
              <button
                onClick={onEndPoll}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-mono rounded bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 font-bold transition active:scale-95 cursor-pointer"
              >
                <Ban className="w-3 h-3" />
                Kill Poll
              </button>
            )}
          </div>

          {activePoll ? (
            /* Active tracker metrics show inside builder too */
            <div className="bg-[#0f1119] border border-emerald-950/40 p-4 rounded-xl text-center space-y-2">
              <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest inline-flex items-center gap-1 animate-pulse">
                POLL BROADCAST_ACTIVE
              </span>
              <p className="font-sans font-medium text-xs text-white leading-normal pt-2">"{activePoll.question}"</p>
              <div className="flex justify-center gap-5 mt-2 pt-2.5 border-t border-slate-900">
                <div>
                  <span className="font-mono text-[8px] text-slate-500 block">VOTE PACKETS</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">{activePoll.totalVotes}</span>
                </div>
                <div>
                  <span className="font-mono text-[8px] text-slate-500 block">TIME_REMAINING</span>
                  <span className="font-mono text-sm font-bold text-slate-200">{activePoll.timeLeft}s</span>
                </div>
              </div>
            </div>
          ) : (
            /* New custom draft forms block */
            <form onSubmit={handleStartCustomPoll} className="space-y-4">
              <div className="space-y-1">
                <label className="font-sans text-[10px] text-slate-400 font-semibold block uppercase">Question</label>
                <input
                  type="text"
                  required
                  placeholder="Enter polling topic..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-[#10121d] border border-[#232736] text-white py-2 px-3 rounded-xl text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[10px] text-slate-400 font-semibold block uppercase">Options (Min 2)</label>
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="text-[9px] font-sans font-semibold text-emerald-400 flex items-center gap-0.5 cursor-pointer hover:underline"
                    >
                      <Plus className="w-2.5 h-2.5" /> ADD OPT
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        required={i < 2}
                        placeholder={`Option #${i + 1}`}
                        value={opt}
                        onChange={(e) => updateOptionValue(i, e.target.value)}
                        className="flex-1 bg-[#10121d] border border-[#232736] text-white py-1.5 px-3 rounded-lg text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionField(i)}
                          className="p-1 px-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-sans text-[10px] text-slate-400 font-semibold block uppercase mb-1">Timer Duration</label>
                  <select
                    value={pollDuration}
                    onChange={(e) => setPollDuration(parseInt(e.target.value))}
                    className="w-full bg-[#10121d] border border-[#232736] text-white py-1.5 px-2.5 rounded-lg text-xs focus:outline-none"
                  >
                    <option value={15}>15 Seconds (Fast Test)</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={120}>120 Seconds</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="self-end py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Launch Live Poll
                </button>
              </div>
            </form>
          )}

          {/* Testing presets panel list */}
          <div className="border-t border-[#1e2235] pt-4">
            <span className="font-sans text-[10px] text-slate-400 font-semibold uppercase block mb-2.5">
              🚀 Broadcaster One-Click Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_POLLS.map((preset) => (
                <button
                  key={preset.category}
                  disabled={!!activePoll}
                  onClick={() => applyPresetPoll(preset)}
                  className="text-left p-2.5 rounded-xl border border-[#232736]/40 hover:border-[#38bdf8]/55 bg-[#0e1017] hover:bg-[#151928] transition group cursor-pointer disabled:opacity-45 disabled:pointer-events-none"
                >
                  <p className="font-mono text-[8px] text-indigo-400 group-hover:text-cyan-400 transition font-semibold uppercase">
                    {preset.category}
                  </p>
                  <p className="font-sans text-[10px] text-slate-300 group-hover:text-white transition line-clamp-1 mt-0.5 font-medium">
                    "{preset.question}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
