import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProfile } from "../types";
import { Send, Smile, ShieldAlert, Trash2, ShieldCheck, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LiveChatProps {
  channelId: string;
  messages: ChatMessage[];
  currentUser: UserProfile | null;
  onSendMessage: (text: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onOpenSignInModal: () => void;
  accentColorClass: string;
}

const POPULAR_EMOJIS = ["🔥", "❤️", "🙌", "🎉", "🚀", "🎵", "🕺", "🎧", "🤩", "📻", "🎙️", "✨"];

export default function LiveChat({
  channelId,
  messages,
  currentUser,
  onSendMessage,
  onDeleteMessage,
  onOpenSignInModal,
  accentColorClass,
}: LiveChatProps) {
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chats to the live edge on new message arrival
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, channelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length > 255) return;

    onSendMessage(trimmed);
    setInputText("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    if (inputText.length + emoji.length <= 255) {
      setInputText((prev) => prev + emoji);
    }
  };

  const charsRemaining = 255 - inputText.length;

  return (
    <div id="live-chat-panel" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl flex flex-col h-[520px] shadow-2xl overflow-hidden relative backdrop-blur-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#232736]/60 bg-[#161925]/50">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-sans font-semibold text-sm text-white tracking-tight">Community Chat Feed</h4>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded border border-[#232736]/40">
          <span>{messages.filter(m => m.channelId === channelId).length} MESSAGES</span>
        </div>
      </div>

      {/* Messages Scroll viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-[#232736] scrollbar-track-transparent">
        {messages.filter(m => m.channelId === channelId).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <RadioWavePlaceholder />
            <p className="font-sans text-xs mt-3">Radio silent. Be the first to strike a conversation!</p>
          </div>
        ) : (
          messages
            .filter((m) => m.channelId === channelId)
            .map((msg) => {
              const isOwnMessage = currentUser && msg.userId === currentUser.id;
              const canDelete = isOwnMessage || (currentUser && currentUser.isAdmin);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="group flex items-start gap-2.5"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sm shadow-sm select-none flex-shrink-0">
                    {msg.avatar}
                  </div>

                  {/* Message Bubble Block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="font-sans font-semibold text-xs leading-none truncate"
                          style={{ color: msg.color || "#38bdf8" }}
                        >
                          {msg.username}
                        </span>
                        {msg.isAdmin && (
                          <span className="font-mono text-[8px] bg-red-500/10 text-red-400 border border-red-500/25 px-1 py-0.2 rounded font-bold uppercase flex items-center gap-0.5 scale-95 flex-shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Broadcaster
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-gray-500 flex-shrink-0">{msg.timestamp}</span>
                    </div>

                    <div className="relative mt-1">
                      <p className="font-sans text-xs text-slate-200 bg-[#161a29]/60 border border-[#232736]/40 p-2.5 rounded-xl rounded-tl-none break-words leading-relaxed shadow-sm">
                        {msg.content}
                      </p>

                      {/* Delete controller */}
                      {canDelete && (
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition p-1 text-slate-500 hover:text-red-400 rounded-md hover:bg-slate-800/50 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input / Control Footer Block */}
      <div className="border-t border-[#232736]/60 bg-[#141724]/90 p-3.5 relative">
        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Emoji Insertion bar */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="bg-[#121420] border border-[#232736] p-2 rounded-xl flex flex-wrap gap-1.5 justify-center shadow-lg relative z-20"
                >
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#202538] text-center active:scale-90 text-sm transition relative cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Core input field row */}
            <div className="flex gap-2 relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center hover:bg-[#1a1e2f] bg-[#10121d] cursor-pointer ${
                  showEmojiPicker ? "text-cyan-400 border-cyan-800" : "text-slate-400 border-[#232736]"
                }`}
                title="Add Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={255}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Share your musical vibe in chat..."
                  className="w-full bg-[#10121d] border border-[#232736] focus:border-cyan-500 hover:border-slate-700/60 text-white rounded-xl py-2.5 px-3.5 pr-14 text-xs font-sans placeholder-slate-500 focus:outline-none transition"
                />
                
                {/* Visual length tracking label */}
                <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] ${
                  charsRemaining < 30 ? "text-amber-400 font-semibold" : "text-slate-500"
                }`}>
                  {charsRemaining}
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition shadow-sm active:scale-95 text-slate-900 font-semibold cursor-pointer ${
                  inputText.trim()
                    ? "bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 active:scale-95"
                    : "bg-[#181d2d] border border-[#292e44]/60 text-slate-500"
                }`}
              >
                <Send className="w-4 h-4 text-inherit" />
              </button>
            </div>
          </form>
        ) : (
          /* Locked prompt for un-authenticated views */
          <div className="flex flex-col items-center justify-center p-3 text-center bg-[#0c0e14]/50 border border-[#232736]/40 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <p className="font-sans text-xs text-slate-300 mt-1.5 font-medium">Community Chat is Locked</p>
            <p className="font-sans text-[10px] text-slate-500 mt-0.5">Please connect your listening handle to engage in discussions.</p>
            <button
              onClick={onOpenSignInModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-xs font-sans font-semibold text-white cursor-pointer active:scale-95 shadow-lg shadow-indigo-500/15"
            >
              <LogIn className="w-3.5 h-3.5" />
              Connect Handle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Retro pulse decoration for empty comments state
function RadioWavePlaceholder() {
  return (
    <div className="relative flex justify-center items-center w-14 h-14">
      <span className="absolute w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-ping" />
      <span className="absolute w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-full animate-pulse" />
      <span className="relative w-4 h-4 bg-indigo-500 rounded-full border border-[#11131c]" />
    </div>
  );
}
