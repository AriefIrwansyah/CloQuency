import React, { useState, useEffect } from "react";
import { LivePoll, UserProfile } from "../types";
import { Vote, Timer, CheckCircle, BarChart2 } from "lucide-react";
import { motion } from "motion/react";

interface LiveVotingProps {
  poll: LivePoll | null;
  onVote: (optionId: string, index: number) => void;
  accentColorClass: string;
}

export default function LiveVoting({ poll, onVote, accentColorClass }: LiveVotingProps) {
  if (!poll) {
    return (
      <div id="no-active-polls-panel" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center text-center h-44 backdrop-blur-xl">
        <Vote className="w-8 h-8 text-slate-600 animate-pulse" />
        <p className="font-sans text-xs text-slate-400 mt-2.5">No Live Broadcaster Polls Active right now.</p>
        <p className="font-sans text-[10px] text-slate-500 mt-1">Host will broadcast a live voting poll soon. Standby!</p>
      </div>
    );
  }

  const { question, options, timeLeft, isActive, userVotedIndex, totalVotes } = poll;

  // Format digital countdown string: mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const hasVoted = userVotedIndex !== undefined;

  return (
    <div id="live-voting-panel" className="bg-[#11131c]/95 border border-[#232736] rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background neon accent blur */}
      <div className={`absolute top-0 right-0 w-44 h-16 blur-3xl transition-all duration-700 pointer-events-none opacity-10 ${accentColorClass}`} />

      {/* Header telemetry info */}
      <div className="flex items-center justify-between border-b border-[#232736]/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-emerald-400" />
          <span className="font-sans font-semibold text-xs text-white">Live Broadcaster Poll</span>
        </div>

        {/* Timer countdown Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-[#232736]/40 text-[10px] uppercase font-mono">
          <Timer className={`w-3.5 h-3.5 ${timeLeft < 15 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          <span className={timeLeft < 15 ? 'text-rose-500 font-bold' : 'text-slate-300'}>
            {isActive ? `Ends in: ${formatTime(timeLeft)}` : "Poll Closed"}
          </span>
        </div>
      </div>

      {/* Main question */}
      <h4 className="font-sans font-semibold text-sm text-slate-200 tracking-tight leading-snug mb-4">
        {question}
      </h4>

      {/* Options list selection block */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          const votePercent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isSelectedOption = userVotedIndex === idx;

          return (
            <div key={opt.id} className="relative">
              {isActive && !hasVoted ? (
                /* Unvoted: Active selection button mode */
                <button
                  onClick={() => onVote(opt.id, idx)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/40 hover:bg-[#1a1e2f] border border-[#232736] hover:border-slate-700/60 transition group font-sans text-xs text-slate-300 flex justify-between items-center cursor-pointer active:scale-98"
                >
                  <span className="group-hover:text-white transition whitespace-normal text-left max-w-[85%] pr-2">
                    {opt.text}
                  </span>
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center p-0.5 group-hover:border-cyan-500 transition flex-shrink-0">
                    <span className="w-full h-full rounded-full bg-cyan-500 opacity-0 group-hover:opacity-20 transition" />
                  </div>
                </button>
              ) : (
                /* Voted or Closed: Horizontal layout visual graph indicators */
                <div className={`p-3.5 rounded-xl border relative overflow-hidden flex justify-between items-center ${
                  isSelectedOption 
                    ? "bg-[#181d2d] border-[#1d4ed8]/30 text-white" 
                    : "bg-slate-950/30 border-[#232736]/80 text-slate-300"
                }`}>
                  {/* Absolute width visual backdrop graph bar slider */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${votePercent}%` }}
                    transition={{ type: "spring", stiffness: 60 }}
                    className={`absolute left-0 top-0 bottom-0 z-0 opacity-15 ${
                      isSelectedOption 
                        ? "bg-indigo-500" 
                        : "bg-teal-500"
                    }`}
                  />

                  {/* Text labels */}
                  <div className="flex items-center gap-2 relative z-10 min-w-0 pr-2">
                    {isSelectedOption && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                    <span className="font-sans text-xs truncate leading-normal">
                      {opt.text}
                    </span>
                  </div>

                  {/* Percentage indices */}
                  <div className="flex items-baseline gap-1.5 relative z-10 font-mono text-right flex-shrink-0 bg-[#0d101a]/70 px-2 py-0.5 rounded border border-[#202538]/40 shadow-sm">
                    <span className="text-xs font-bold text-slate-100">{votePercent}%</span>
                    <span className="text-[9px] text-gray-500">({opt.votes})</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Aggregate metrics */}
      <div className="mt-4 flex items-center justify-between font-mono text-[9px] text-gray-500 px-1 select-none">
        <span className="flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5" />
          TOTAL METRIC VOTE ROLLS: {totalVotes}
        </span>
        <span>
          {hasVoted ? "✓ YOUR VOTE CASTED" : isActive ? "STANDBY VOTES FROM WIRE..." : "FINAL RESULT SCORE"}
        </span>
      </div>
    </div>
  );
}
