import { BroadcastChannel, LuckyWheelItem, ChatMessage, LivePoll } from "./types";

export const CHANNELS: BroadcastChannel[] = [
  {
    id: "e100",
    name: "E100 (Electronic)",
    frequency: "100.2 MHz",
    genre: "Electronic / Dance / House",
    description: "Sizzling synthesizers, premium house beats, and pure electronic euphoria direct from the global dance floor.",
    streamUrl: "https://c5.siar.us/proxy/ssfm/stream",
    videoUrl: "https://ssfm.siar.us/ssfm/live/playlist.m3u8",
    videoType: "hls",
    accentColor: "text-cyan-400 bg-cyan-400/10 border-cyan-500/35",
    pulseColor: "bg-cyan-500 shadow-cyan-500/50"
  },
  {
    id: "mradio",
    name: "M-Radio (Indie & Pop)",
    frequency: "98.5 MHz",
    genre: "Modern Indie / Alt Rock / Synthpop",
    description: "Your daily sonic retreat featuring handcrafted lyrics, lush acoustic arrangements, and fresh indie pop melodies.",
    streamUrl: "https://c4.siar.us/proxy/mradio/stream",
    videoUrl: "mspaceappppp",
    videoType: "twitch",
    accentColor: "text-amber-400 bg-amber-400/10 border-amber-500/35",
    pulseColor: "bg-amber-500 shadow-amber-500/50"
  },
  {
    id: "sheradio",
    name: "SheRadio (Chillout)",
    frequency: "88.1 MHz",
    genre: "Chillout / Ambient / Downtempo",
    description: "Escape into tranquil cosmic soundscapes, deep atmospheric sweeps, and soothing rhythmic downtempo.",
    streamUrl: "https://c4.siar.us/proxy/sheradio/stream",
    videoUrl: "https://www.youtube.com/embed/DWvZWYSLF7U?autoplay=1&mute=1&playlist=DWvZWYSLF7U&loop=1&controls=0",
    videoType: "youtube",
    accentColor: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-500/35",
    pulseColor: "bg-fuchsia-500 shadow-fuchsia-500/50"
  }
];

export const DEFAULT_WHEEL_ITEMS: LuckyWheelItem[] = [
  { id: "w1", text: "Free VIP Festival Pass 🎫", color: "#FF1493" },
  { id: "w2", text: "CloQuency Hoodie 🧥", color: "#00BFFF" },
  { id: "w3", text: "Request Next Track 🎵", color: "#FF8C00" },
  { id: "w4", text: "Live On-Air Shoutout 🎙️", color: "#32CD32" },
  { id: "w5", text: "Backstage Tour Card 🎟️", color: "#9932CC" },
  { id: "w6", text: "Exclusive Vinyl Record 💿", color: "#FFD700" },
  { id: "w7", text: "Artist Signed Poster 🖼️", color: "#1E90FF" },
  { id: "w8", text: "Sticker Badge Pack 🏷️", color: "#FF4500" }
];

export const MOCK_USERNAMES = [
  { name: "DJ_WaveRider", avatar: "🎧", color: "#38bdf8" },
  { name: "BeatBlaster99", avatar: "💥", color: "#f87171" },
  { name: "SynthDreamer", avatar: "🌌", color: "#c084fc" },
  { name: "AcousticSoul", avatar: "🎸", color: "#fbbf24" },
  { name: "ChilledOutCat", avatar: "🐱", color: "#34d399" },
  { name: "FrequencyFlyer", avatar: "🚀", color: "#fb7185" },
  { name: "SignalBreaker", avatar: "📡", color: "#2dd4bf" },
  { name: "VolumeMax", avatar: "🔊", color: "#a78bfa" },
  { name: "BassCatcher", avatar: "🐟", color: "#f472b6" },
  { name: "SonicPioneer", avatar: "🧭", color: "#60a5fa" }
];

export const CHANNEL_DEFAULT_CHAT: Record<string, ChatMessage[]> = {
  e100: [
    {
      id: "e1",
      channelId: "e100",
      userId: "m1",
      username: "DJ_WaveRider",
      avatar: "🎧",
      color: "#38bdf8",
      content: "Loving this progressive house track right now! The visualizer is absolutely syncing with my heartbeat.",
      timestamp: "14:40",
      isAdmin: false
    },
    {
      id: "e2",
      channelId: "e100",
      userId: "m2",
      username: "FrequencyFlyer",
      avatar: "🚀",
      color: "#fb7185",
      content: "Broadcaster, what's the name of this track? Need to add this to my workout playlist immediately!",
      timestamp: "14:41",
      isAdmin: false
    },
    {
      id: "e3",
      channelId: "e100",
      userId: "admin_dj",
      username: "Host_Max",
      avatar: "🎙️",
      color: "#2dd4bf",
      content: "⚡ High energy today in E100! That track was 'Midnight Pulse' by CloQuency Project. Get ready for a lucky wheel stream in a couple of minutes!",
      timestamp: "14:42",
      isAdmin: true
    }
  ],
  mradio: [
    {
      id: "m1",
      channelId: "mradio",
      userId: "m3",
      username: "AcousticSoul",
      avatar: "🎸",
      color: "#fbbf24",
      content: "This acoustic indie set is exactly what I needed for writing my report today. Pure acoustic comfort.",
      timestamp: "14:38",
      isAdmin: false
    },
    {
      id: "m2",
      channelId: "mradio",
      userId: "m4",
      username: "BassCatcher",
      avatar: "🐟",
      color: "#f472b6",
      content: "M-Radio has the absolute best selection of underground synthpop. Glad I found CloQuency!",
      timestamp: "14:39",
      isAdmin: false
    },
    {
      id: "m3",
      channelId: "mradio",
      userId: "admin_pop",
      username: "Host_Sophia",
      avatar: "🎤",
      color: "#f472b6",
      content: "Welcome in indie lovers! 🥰 Dropped a new live poll. Vote on your favorite musical decade so I can queue up the next classic block!",
      timestamp: "14:41",
      isAdmin: true
    }
  ],
  sheradio: [
    {
      id: "s1",
      channelId: "sheradio",
      userId: "m5",
      username: "SynthDreamer",
      avatar: "🌌",
      color: "#c084fc",
      content: "Diving deep into the ambient cosmos. This station is literal brain therapy.",
      timestamp: "14:35",
      isAdmin: false
    },
    {
      id: "s2",
      channelId: "sheradio",
      userId: "m6",
      username: "ChilledOutCat",
      avatar: "🐱",
      color: "#34d399",
      content: "Putting on my headphones, dimming the lights, and soaking in these drones. Thank you SheRadio.",
      timestamp: "14:37",
      isAdmin: false
    }
  ]
};

export const CHATTER_COMMENTS: Record<string, string[]> = {
  e100: [
    "OMG that bass drop was sensational!",
    "Can we get some tech house next spin?",
    "Club vibe is 10/10 right now",
    "Turn it up, turn it up! 🔊🔊🔊",
    "Dancing in my living room literally, hope nobody is watching haha",
    "Perfect weekend warm-up stream",
    "E100 is hands down the absolute king of electronic broadcasting",
    "Who is mixing right now? It fits perfectly!",
    "Ready for the weekly giveaway! Let me win that hoodie!",
    "Request: Space Wanderer. Pls broadcaster!"
  ],
  mradio: [
    "This track has beautiful melodies.",
    "This singer's vocals are giving me goosebumps right now.",
    "Indie is alive and well! Beautiful tune.",
    "Is this track on Spotify yet? Anyone know?",
    "Perfect music to cook or stargaze to.",
    "I'm voting for 90s indie! Let's get some grunge vibe going.",
    "Love the host's radio voice, so friendly!",
    "Beautiful indie pop vibes, loving the guitar work.",
    "What a great discovery. Subscribed instantly!",
    "Can we request some tracks?"
  ],
  sheradio: [
    "Deep meditation session initiated. 💫🌱",
    "Unwinding with this beautiful ambient wash.",
    "Space sounds are perfect. Reminds me of Stellaris soundtrack.",
    "This drone is vibrating my desk, it feels incredibly soothing.",
    "Literally fell asleep for a second, so peaceful.",
    "Thank you CloQuency for keeping SheRadio running 24/7.",
    "Perfect for writing code or sketching.",
    "Lush synth pads are incredible here.",
    "Is it just me, or does this station feel like cozy rain on a roof?",
    "Beautifully chilled."
  ]
};

export const INITIAL_POLLS: Record<string, LivePoll> = {
  e100: {
    id: "p_e100",
    channelId: "e100",
    question: "Which electronic subgenre should fuel our next hour?",
    options: [
      { id: "o1", text: "Organic / Deep House", votes: 42 },
      { id: "o2", text: "Cyber Synthwave & Electro", votes: 68 },
      { id: "o3", text: "Liquid Drum & Bass", votes: 54 },
      { id: "o4", text: "Uplifting DJ Trance Set", votes: 31 }
    ],
    totalVotes: 195,
    duration: 60,
    timeLeft: 45,
    isActive: true
  },
  mradio: {
    id: "p_mradio",
    channelId: "mradio",
    question: "What decade is your favorite Indie/Pop era?",
    options: [
      { id: "o1_m", text: "Glorious 80s Synthpop", votes: 55 },
      { id: "o2_m", text: "Roaring 90s Alternative / Grunge", votes: 41 },
      { id: "o3_m", text: "Indie Rock Revival (2000s)", votes: 72 },
      { id: "o4_m", text: "Modern Bedroom Pop (Present)", votes: 60 }
    ],
    totalVotes: 228,
    duration: 90,
    timeLeft: 75,
    isActive: true
  },
  sheradio: {
    id: "p_sheradio",
    channelId: "sheradio",
    question: "Select your preferred ambient background motif:",
    options: [
      { id: "o1_s", text: "Interstellar Space Drones", votes: 29 },
      { id: "o2_s", text: "Warm Cozy Rainy Cabin", votes: 47 },
      { id: "o3_s", text: "Ocean Wave Frequencies", votes: 33 }
    ],
    totalVotes: 109,
    duration: 120,
    timeLeft: 110,
    isActive: true
  }
};
