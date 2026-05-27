import React, { useState } from "react";
import { X, Shuffle, CheckCircle } from "lucide-react";
import { UserProfile } from "../types";
import { MOCK_USERNAMES } from "../data";
import { motion } from "motion/react";

interface SignInModalProps {
  onClose: () => void;
  onSignIn: (user: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  "🎧", "🎧", "🤘", "🕺", "💃", "🎤", "🎸", "🥁", 
  "🐱", "🐶", "🦊", "👽", "👾", "🤖", "🚀", "🔥", "🪐"
];

const AVATAR_COLORS = [
  "#38bdf8", "#f87171", "#c084fc", "#fbbf24", "#34d399", 
  "#fb7185", "#2dd4bf", "#a78bfa", "#f472b6", "#60a5fa"
];

export default function SignInModal({ onClose, onSignIn }: SignInModalProps) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const handleRollRandom = () => {
    const rolled = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
    setUsername(rolled.name);
    setSelectedAvatar(rolled.avatar);
    setSelectedColor(rolled.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    // Build the UserProfile object
    const user: UserProfile = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      username: trimmed,
      avatar: selectedAvatar,
      color: selectedColor,
      isAdmin: false, // Starts as standard listener. Toggled via head Shield Icon
    };

    onSignIn(user);
    onClose();
  };

  return (
    <div id="signin-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#151826] border border-[#2d334e] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal dismiss button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#252a3f] active:scale-95 border border-transparent hover:border-[#303856]/60 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <span className="text-2xl select-none">📻</span>
          <h3 className="font-sans font-bold text-base text-white mt-2">Connect Station Handle</h3>
          <p className="font-sans text-xs text-slate-400 mt-1">Create a physical listener handle to speak in chat feeds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID text form field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
              <label>Pseudonym Handle</label>
              <button
                type="button"
                onClick={handleRollRandom}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Shuffle className="w-3 h-3" /> Roll Random
              </button>
            </div>
            
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. DJ_EchoSparks"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
              className="w-full bg-[#10121d] border border-[#232736] text-white py-2.5 px-3.5 rounded-xl text-xs font-sans placeholder-slate-500 focus:outline-[#343b5a] focus:outline focus:border-[#404b77] transition"
            />
          </div>

          {/* Avatar selector slider widget */}
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-slate-400 font-semibold block uppercase">Select Profile Avatar</span>
            <div className="flex flex-wrap gap-1.5 bg-[#0f111a] border border-[#232736]/60 p-2.5 rounded-xl justify-center max-h-24 overflow-y-auto">
              {AVATAR_OPTIONS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition relative active:scale-90 cursor-pointer ${
                    selectedAvatar === av ? "bg-indigo-500/20 border border-indigo-500 scale-110" : "hover:bg-[#1f2234] border border-transparent"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Color tag picker list */}
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-slate-400 font-semibold block uppercase">Accent Color</span>
            <div className="flex justify-between bg-[#0f111a] border border-[#232736]/60 p-2 px-3 rounded-xl">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-4 h-4 rounded-full transition active:scale-90 cursor-pointer relative flex items-center justify-center`}
                  style={{ backgroundColor: col }}
                >
                  {selectedColor === col && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 text-white font-sans font-bold text-xs shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            Connected & Connect Live
          </button>
        </form>
      </motion.div>
    </div>
  );
}
