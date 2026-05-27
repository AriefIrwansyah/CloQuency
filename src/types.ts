export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  isAdmin: boolean;
  color: string;
}

export interface BroadcastChannel {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  description: string;
  streamUrl: string;
  videoUrl: string; // Embeddable video URL (e.g., YouTube embed or Twitch embed or visualizer)
  videoType?: "hls" | "twitch" | "youtube";
  accentColor: string;
  pulseColor: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatar: string;
  color: string;
  content: string;
  timestamp: string; // ISO String or display format
  isAdmin: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface LivePoll {
  id: string;
  channelId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  duration: number; // total duration in seconds
  timeLeft: number; // countdown in seconds
  isActive: boolean;
  userVotedIndex?: number; // index of option user selected, undefined if not voted
}

export interface LuckyWheelItem {
  id: string;
  text: string;
  color: string;
}
