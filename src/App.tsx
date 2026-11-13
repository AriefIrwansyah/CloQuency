/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { CHANNELS, DEFAULT_WHEEL_ITEMS, E100_WHEEL_ITEMS, MRADIO_WHEEL_ITEMS, SHERADIO_WHEEL_ITEMS, CHANNEL_DEFAULT_CHAT, CHATTER_COMMENTS, MOCK_USERNAMES, INITIAL_POLLS } from "./data";
import { BroadcastChannel, ChatMessage, LivePoll, LuckyWheelItem, UserProfile } from "./types";
import MediaPlayer from "./components/MediaPlayer";
import LiveChat from "./components/LiveChat";
import LuckyWheel from "./components/LuckyWheel";
import LiveVoting from "./components/LiveVoting";
import AdminPanel from "./components/AdminPanel";
import SignInModal from "./components/SignInModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  LogOut, 
  SlidersHorizontal, 
  Info, 
  Wifi, 
  Sparkles, 
  RadioTower,
  Cpu, 
  PlusCircle, 
  MessageSquare
} from "lucide-react";

export default function App() {
  // Navigation & Channels
  const [activeChannel, setActiveChannel] = useState<BroadcastChannel>(CHANNELS[0]);
  const [currentTab, setCurrentTab] = useState<"station" | "admin" | "about">("station");
  
  // Audio & Streams Parameters
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [streamMode, setStreamMode] = useState<"audio" | "video">("audio");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Standard mock user on boot for frictionless testing, or null so they hit sign in
    return null;
  });
  const [showSignIn, setShowSignIn] = useState(false);
  const [adminPrivilegeRequested, setAdminPrivilegeRequested] = useState(false);

  // Dynamic Content Collections (Preserved individually by Channel ID)
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>(CHANNEL_DEFAULT_CHAT);
  const [allPolls, setAllPolls] = useState<Record<string, LivePoll | null>>(INITIAL_POLLS);
  const [allWheelItems, setAllWheelItems] = useState<Record<string, LuckyWheelItem[]>>({
    e100: [...E100_WHEEL_ITEMS],
    mradio: [...MRADIO_WHEEL_ITEMS],
    sheradio: [...SHERADIO_WHEEL_ITEMS]
  });

  const [notifications, setNotifications] = useState<string[]>([]);

  // Push elegant auto-dismissing broadcaster toasts
  const addToast = (msg: string) => {
    setNotifications((prev) => [...prev, msg]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 4000);
  };

  // Switch Admin/Broadcaster role toggle and sync currentUser
  const handleToggleAdminMode = () => {
    if (!currentUser) {
      addToast("⚠️ Click 'Sign In' first to connect a handle before claiming Admin privileges!");
      setShowSignIn(true);
      return;
    }

    const updatedAdminState = !currentUser.isAdmin;
    const updatedUser = { ...currentUser, isAdmin: updatedAdminState };
    setCurrentUser(updatedUser);
    setAdminPrivilegeRequested(updatedAdminState);

    if (updatedAdminState) {
      addToast("👑 Broadcaster privileges ACTIVATED. Control Panel unlocked.");
    } else {
      addToast("👤 Switched to standard listener view mode.");
      if (currentTab === "admin") {
        setCurrentTab("station");
      }
    }
  };

  // Initialize a mock logged-in state of a typical listener for easier onboarding
  useEffect(() => {
    // Generate standard persona on launch so users don't have empty experience, but can change
    const defaultUser: UserProfile = {
      id: "u_standard",
      username: "StudioListener",
      avatar: "🎧",
      color: "#2dd4bf",
      isAdmin: false
    };
    setCurrentUser(defaultUser);
  }, []);

  // Poll Counter & Simulated Voter Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Progress active timer countdowns across channels
      setAllPolls((prevPolls) => {
        const updated = { ...prevPolls };
        let stateChanged = false;

        Object.keys(updated).forEach((chId) => {
          const poll = updated[chId];
          if (poll && poll.isActive) {
            stateChanged = true;
            const updatedTime = poll.timeLeft - 1;
            
            // Randomly cast mock voter entries during active state
            let optionsCopy = [...poll.options];
            let addedVotes = 0;

            if (updatedTime > 0 && Math.random() > 0.4) {
              // Simulate incoming listener vote packages
              const randIdx = Math.floor(Math.random() * optionsCopy.length);
              const countToIncr = Math.floor(Math.random() * 3) + 1;
              optionsCopy[randIdx] = {
                ...optionsCopy[randIdx],
                votes: optionsCopy[randIdx].votes + countToIncr
              };
              addedVotes = countToIncr;
            }

            updated[chId] = {
              ...poll,
              timeLeft: Math.max(0, updatedTime),
              isActive: updatedTime > 0,
              options: optionsCopy,
              totalVotes: poll.totalVotes + addedVotes
            };
          }
        });

        return stateChanged ? updated : prevPolls;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Live Crowd Simulating Chat Engine
  useEffect(() => {
    const chatSim = setInterval(() => {
      // Periodic crowd chat insertion matching current active station vibes
      const curChanId = activeChannel.id;
      const candidates = CHATTER_COMMENTS[curChanId];
      if (!candidates || candidates.length === 0) return;

      const randomComment = candidates[Math.floor(Math.random() * candidates.length)];
      const botProfile = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
      
      const newComment: ChatMessage = {
        id: "msg_bot_" + Math.random().toString(36).substring(2, 7),
        channelId: curChanId,
        userId: "bot_" + botProfile.name,
        username: botProfile.name,
        avatar: botProfile.avatar,
        color: botProfile.color,
        content: randomComment,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAdmin: false
      };

      setAllChats((prev) => ({
        ...prev,
        [curChanId]: [...(prev[curChanId] || []), newComment]
      }));

    }, 10000); // Inserts message every 10 seconds to keep station highly engaging

    return () => clearInterval(chatSim);
  }, [activeChannel]);

  // Handle outgoing chats
  const handleSendMessage = (text: string) => {
    if (!currentUser) return;
    const curChanId = activeChannel.id;

    const customMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      channelId: curChanId,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      color: currentUser.color,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: currentUser.isAdmin
    };

    setAllChats((prev) => ({
      ...prev,
      [curChanId]: [...(prev[curChanId] || []), customMsg]
    }));
  };

  // Handle comment deletions (moderation)
  const handleDeleteMessage = (msgId: string) => {
    const curChanId = activeChannel.id;
    setAllChats((prev) => ({
      ...prev,
      [curChanId]: (prev[curChanId] || []).filter((m) => m.id !== msgId)
    }));
    addToast("🗑️ Comment purged by broadcaster authorization.");
  };

  // Add/Remove Prize items from lucky wheel slice state
  const handleAddWheelItem = (formattedInput: string) => {
    // Formatted input is: Text [ColorHex]
    const colorMatch = formattedInput.match(/\[(.*?)\]/);
    const extractionColor = colorMatch ? colorMatch[1] : "#3b82f6";
    const extractionLabel = formattedInput.replace(/\[.*?\]/, "").trim();

    const newItem: LuckyWheelItem = {
      id: "wheel_" + Date.now().toString(),
      text: extractionLabel,
      color: extractionColor
    };

    const curChanId = activeChannel.id;
    setAllWheelItems((prev) => ({
      ...prev,
      [curChanId]: [...(prev[curChanId] || []), newItem]
    }));
    addToast(`🎁 Wheel slice added: "${extractionLabel}"`);
  };

  const handleRemoveWheelItem = (itemId: string) => {
    const curChanId = activeChannel.id;
    const items = allWheelItems[curChanId] || [];
    if (items.length <= 3) return; // Prevent draining the wheel!

    setAllWheelItems((prev) => ({
      ...prev,
      [curChanId]: (prev[curChanId] || []).filter((it) => it.id !== itemId)
    }));
    addToast("Remove prize slice from wheel configuration.");
  };

  // Start broadcaster custom polls
  const handleStartPoll = (question: string, optionsList: string[], durationSeconds: number) => {
    const curChanId = activeChannel.id;
    const formattedOptions = optionsList.map((txt, i) => ({
      id: `opt_${i}_${Date.now()}`,
      text: txt,
      votes: 0
    }));

    const newPoll: LivePoll = {
      id: "poll_" + Date.now(),
      channelId: curChanId,
      question: question,
      options: formattedOptions,
      totalVotes: 0,
      duration: durationSeconds,
      timeLeft: durationSeconds,
      isActive: true
    };

    setAllPolls((prev) => ({
      ...prev,
      [curChanId]: newPoll
    }));
    addToast(`🗳️ NEW ON-AIR POLL DISPATCHED: "${question}"`);
  };

  // End active polls prematuraly
  const handleEndPoll = () => {
    const curChanId = activeChannel.id;
    setAllPolls((prev) => {
      const current = prev[curChanId];
      if (!current) return prev;
      return {
        ...prev,
        [curChanId]: {
          ...current,
          isActive: false,
          timeLeft: 0
        }
      };
    });
    addToast("🛑 Currently on-air poll locked prematurely.");
  };

  // User submits standard poll vote
  const handleCastVote = (optionId: string, index: number) => {
    const curChanId = activeChannel.id;
    setAllPolls((prev) => {
      const current = prev[curChanId];
      if (!current || !current.isActive) return prev;

      const incrementedOptions = current.options.map((opt, i) => {
        if (i === index) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      return {
        ...prev,
        [curChanId]: {
          ...current,
          options: incrementedOptions,
          totalVotes: current.totalVotes + 1,
          userVotedIndex: index
        }
      };
    });
    addToast("✓ Your micro poll vote has been transmitted on-air.");
  };

  const handleSignIn = (profile: UserProfile) => {
    setCurrentUser(profile);
    addToast(`👋 Connected handle: @${profile.username}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setAdminPrivilegeRequested(false);
    addToast("🚪 Disconnected profile handle from CloQuency.");
  };

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic broadcaster toast alerts stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {notifications.map((note, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="bg-[#121422] border border-slate-700/50 p-3.5 px-4 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-auto"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="font-sans text-xs font-semibold text-slate-200">{note}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Studio Header */}
      <header className="border-b border-[#1f2336] bg-[#0d0f17]/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col min-[520px]:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Pulsing visual Tower */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20">
              <RadioTower className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-black text-white tracking-tight text-lg uppercase leading-none">
                  CloQuency
                </h1>
                <span className="font-mono text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                  LIVE ON-AIR
                </span>
              </div>
              <p className="font-mono text-[9px] text-[#22d3ee] tracking-wider mt-0.5 uppercase flex items-center gap-1 select-none">
                <Cpu className="w-2.5 h-2.5" />
                CLOUD BROADCAST NETWORK // FM MULTIPLEX
              </p>
            </div>
          </div>

          {/* Central Channel Switcher */}
          <div className="flex items-center bg-[#151825] border border-[#232736] p-1 rounded-xl shadow-inner w-full min-[520px]:w-auto justify-center">
            {CHANNELS.map((ch) => {
              const isActive = activeChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch);
                    addToast(`📻 Switched to Station: ${ch.name}`);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-sans font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#252a3f] text-white shadow border border-[#3b4363]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2f]"
                  }`}
                >
                  <Wifi className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                  {ch.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Right Handle details / Authentication panel */}
          <div id="header-user-actions" className="flex items-center gap-2.5 w-full min-[520px]:w-auto justify-end">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-[#141723] border border-[#232736]/60 p-1.5 px-3 rounded-xl">
                {/* Avatar Icon */}
                <span className="text-sm select-none">{currentUser.avatar}</span>
                <div className="text-left min-w-0">
                  <p className="font-sans font-bold text-xs text-white leading-none truncate max-w-[100px]">
                    {currentUser.username}
                  </p>
                  <p className="font-mono text-[8px] text-gray-400 mt-1 uppercase truncate font-semibold">
                    {currentUser.isAdmin ? "👑 Host Admin" : "👤 LISTENER"}
                  </p>
                </div>
                
                {/* Disconnect trigger */}
                <button
                  onClick={handleSignOut}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/40 transition cursor-pointer"
                  title="Disconnect handle"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-xs font-sans font-bold text-white rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Broadcaster/Admin quick shield privilege triggers */}
            <button
              id="admin-shiled-mod-toggle"
              onClick={handleToggleAdminMode}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer relative group ${
                currentUser?.isAdmin
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10"
                  : "bg-[#141723]/80 text-[#545f82] hover:text-white border-[#232736]/80 hover:bg-[#1c2033]"
              }`}
              title="Toggle Broadcaster Admin privileges"
            >
              {currentUser?.isAdmin ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              
              {/* Micro interactive pulse dot */}
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#0d0f17] ${
                currentUser?.isAdmin ? "bg-rose-500 animate-pulse" : "bg-gray-600"
              }`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        
        {/* Tab switch Navigation menu */}
        <div className="flex border-b border-[#202436]/60 gap-1 select-none">
          <button
            onClick={() => setCurrentTab("station")}
            className={`py-2 px-4 border-b-2 font-sans text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === "station"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Active Broadcasting Station
          </button>

          {/* Broadcaster console tab. Blocked if not admin */}
          <button
            id="tab-broadcaster-control"
            onClick={() => {
              if (currentUser?.isAdmin) {
                setCurrentTab("admin");
              } else {
                addToast("👑 Broadcaster control is locked. Toggle the Shield Icon in the header to activate!");
              }
            }}
            className={`py-2 px-4 border-b-2 font-sans text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              currentUser?.isAdmin
                ? currentTab === "admin"
                  ? "border-rose-500 text-white"
                  : "border-transparent text-slate-300 hover:text-white"
                : "border-transparent text-slate-600 cursor-not-allowed"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Broadcaster Console
            {!currentUser?.isAdmin && (
              <span className="text-[8px] bg-slate-950 text-slate-500 border border-slate-800 px-1 py-0.2 rounded font-bold uppercase ml-1 scale-90">
                LOCKED
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab("about")}
            className={`py-2 px-4 border-b-2 font-sans text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === "about"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Blueprint Purpose
          </button>
        </div>

        {/* Tab View Content Renderer */}
        <AnimatePresence mode="wait">
          {currentTab === "station" && (
            <motion.div
              key="station_tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* LEFT COLUMN: Player & Polls (lg:span-7) */}
              <div className="lg:col-span-7 space-y-6">
                <MediaPlayer
                  activeChannel={activeChannel}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  volume={volume}
                  onVolumeChange={setVolume}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  streamMode={streamMode}
                  onStreamModeChange={setStreamMode}
                />

                <LiveVoting
                  poll={allPolls[activeChannel.id]}
                  onVote={handleCastVote}
                  accentColorClass={activeChannel.accentColor}
                />
              </div>

              {/* RIGHT COLUMN: Chat & Lucky Wheel (lg:span-5) */}
              <div className="lg:col-span-5 space-y-6">
                <LiveChat
                  channelId={activeChannel.id}
                  messages={allChats[activeChannel.id] || []}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onOpenSignInModal={() => setShowSignIn(true)}
                  accentColorClass={activeChannel.accentColor}
                />

                <LuckyWheel
                  channelId={activeChannel.id}
                  currentUser={currentUser}
                  items={allWheelItems[activeChannel.id] || []}
                  accentColorClass={activeChannel.accentColor}
                />
              </div>
            </motion.div>
          )}

          {currentTab === "admin" && currentUser?.isAdmin && (
            <motion.div
              key="admin_tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel
                channelId={activeChannel.id}
                wheelItems={allWheelItems[activeChannel.id] || []}
                onAddWheelItem={handleAddWheelItem}
                onRemoveWheelItem={handleRemoveWheelItem}
                onStartPoll={handleStartPoll}
                onEndPoll={handleEndPoll}
                activePoll={allPolls[activeChannel.id]}
                onTriggerSpin={() => addToast("💥 Spin launch packet transmitted to wheel!")}
                isSpinning={false}
                accentColorClass={activeChannel.accentColor}
              />
            </motion.div>
          )}

          {currentTab === "about" && (
            <motion.div
              key="about_tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-7 shadow-2xl relative max-w-4xl mx-auto backdrop-blur-xl"
            >
              <h2 className="font-sans font-extrabold text-white text-xl tracking-tight uppercase border-b border-slate-800 pb-3">
                About CloQuency (Cloud Frequency)
              </h2>
              
              <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-300 font-sans">
                <p>
                  <strong className="text-[#22d3ee]">CloQuency</strong> is a state-of-the-art interactive live stream radio station dashboard engineered to bridge the gap between traditional broadcast media layouts and modern digital community interactions. It seamlessly integrates continuous live audio streams, video cams, and real-time community engagement utilities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="bg-[#161a29]/60 p-4 rounded-xl border border-[#232736]/40">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 text-indigo-400">
                      <PlusCircle className="w-4 h-4" /> Listener Empowerment
                    </h4>
                    <p className="text-slate-400 text-xs mt-1.5">
                      Listeners switch seamlessly between three custom-themed radio waves (E100, M-Radio, SheRadio), connect handles in chat feeds, cast dynamic on-air votes, and participate in continuous broadcaster giveaways in real-time.
                    </p>
                  </div>

                  <div className="bg-[#161a29]/60 p-4 rounded-xl border border-[#232736]/40">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 text-rose-400">
                      <SlidersHorizontal className="w-4 h-4" /> Broadcasting Console
                    </h4>
                    <p className="text-slate-400 text-xs mt-1.5">
                      Radio hosts are supported with dynamic administrative tools. They can initiate custom polling segments, adjust virtual mixer dials, customize wheel prize nodes, and trigger giveaway spins synced with audio announcements.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#1e2235]/60 pt-4 mt-4 space-y-2">
                  <h3 className="font-bold text-white text-xs uppercase tracking-widest text-[#fbbf24]">HOW TO TEST CLINICAL FLOWS</h3>
                  <p className="text-xs text-slate-400">
                    1. <strong>Connect:</strong> Click <span className="text-indigo-400">Sign In</span> in the top header to connect your pseudo-handle (or roll a random DJ name). Type comments in the chat!
                  </p>
                  <p className="text-xs text-slate-400">
                    2. <strong>Broadcaster Privileges:</strong> Click the <span className="text-rose-400">Shield Icon</span> in the top right to claim broadcaster controls. Notice the title change and the new <span className="text-white">Broadcaster Console Tab</span> unlock.
                  </p>
                  <p className="text-xs text-slate-400">
                    3. <strong>Manage Tools:</strong> Navigate to the Broadcaster Console tab, pick a preset Poll, and launch it! Switch back to the Active Broadcasting station to watch simulated listeners vote live. Spin the giveaway wheel to hear voice congratulations.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent global station footer */}
      <footer className="border-t border-[#1f2336] bg-[#07090e] py-4 select-none mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[9px] text-gray-500">
          <p>© 2026 CLOQUENCY LABS INC. CODEC SYNCED // TOKYO SUITE B</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              SYSTEMS STABLE
            </span>
            <span>HLS PROTOCOL COMPLIANT</span>
          </div>
        </div>
      </footer>

      {/* Authentication connected overlay dialog */}
      <AnimatePresence>
        {showSignIn && (
          <SignInModal
            onClose={() => setShowSignIn(false)}
            onSignIn={handleSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
