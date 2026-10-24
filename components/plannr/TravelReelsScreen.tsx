import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Sparkles,
  MapPin,
  Check,
  Send,
  X,
} from 'lucide-react';
import { PlannrScreen, PlannrReel } from './types';

interface TravelReelsScreenProps {
  onNavigate: (screen: PlannrScreen, data?: any) => void;
}

const DEFAULT_REELS: PlannrReel[] = [
  {
    id: 'reel_bali_waterfall',
    reel_url: 'https://instagram.com/reel/C8baliwaterfall',
    creator_handle: '@wander.with.nia',
    creator_name: 'Nia Sharma',
    creator_avatar: 'NK',
    video_title: "Bali's secret waterfall nobody talks about",
    caption:
      "Bali's secret waterfall nobody talks about 🌴 Full 3-day route in this reel!",
    places_detected: [
      {
        name: 'Tegallalang',
        timestamp: '0:04',
        match_percent: 98,
        category: 'Activity',
        notes: 'Stepped rice terrace walks',
      },
      {
        name: 'Tibumana Falls',
        timestamp: '0:14',
        match_percent: 95,
        category: 'Activity',
        notes: 'Secret freshwater canyon pool',
      },
      {
        name: 'Zest Café',
        timestamp: '0:22',
        match_percent: 92,
        category: 'Food',
        notes: 'Ubud artisan brunch',
      },
      {
        name: 'Tirta Empul',
        timestamp: '0:28',
        match_percent: 90,
        category: 'Culture',
        notes: 'Sacred temple spring',
      },
      {
        name: 'Campuhan Ridge',
        timestamp: '0:34',
        match_percent: 85,
        category: 'Activity',
        notes: 'Sunset panoramic stroll',
      },
    ],
    likes_count: 12400,
    comments_count: 342,
    shares_count: 1850,
    destination_tag: 'Bali, Indonesia',
  },
  {
    id: 'reel_vietnam_bays',
    reel_url: 'https://instagram.com/reel/C8halongbay',
    creator_handle: '@roam.with.rahul',
    creator_name: 'Rahul Sen',
    creator_avatar: 'RS',
    video_title: 'Ha Long Bay overnight luxury junk ship',
    caption:
      'Waking up to emerald limestone needles in Vietnam! Full 4-day cruise and Hanoi foodie guide.',
    places_detected: [
      {
        name: 'Ha Long Bay',
        timestamp: '0:06',
        match_percent: 99,
        category: 'Activity',
        notes: 'Limestone karsts & kayak coves',
      },
      {
        name: 'Hanoi Old Quarter',
        timestamp: '0:18',
        match_percent: 94,
        category: 'Food',
        notes: 'Egg coffee & street pho',
      },
    ],
    likes_count: 8900,
    comments_count: 198,
    shares_count: 920,
    destination_tag: 'Vietnam',
  },
];

export const TravelReelsScreen: React.FC<TravelReelsScreenProps> = ({
  onNavigate,
}) => {
  const [reels, setReels] = useState<PlannrReel[]>(DEFAULT_REELS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'near_you'>(
    'for_you'
  );
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(12400);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentsList, setCommentsList] = useState<
    { user: string; text: string; time: string }[]
  >([
    {
      user: 'Aman K.',
      text: 'Adding this secret waterfall to our Bali boys trip right now!',
      time: '2h ago',
    },
    {
      user: 'Priya S.',
      text: 'Is the hike to Tibumana difficult during monsoon?',
      time: '4h ago',
    },
    {
      user: 'TravelGeek',
      text: 'Go early around 7:30 AM before tourist minivans arrive!',
      time: '6h ago',
    },
  ]);
  const [newComment, setNewComment] = useState<string>('');

  const currentReel = reels[currentIndex] || DEFAULT_REELS[0];

  // Fetch reels from backend
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch('/api/plannr/reels');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReels(data);
          }
        }
      } catch {
        // Fallback works seamlessly
      }
    };
    fetchReels();
  }, []);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await fetch(`/api/plannr/reels/${currentReel.id}/like`, {
        method: 'POST',
      });
    } catch {
      // Offline/fallback handling
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      { user: 'You (RS)', text: newComment.trim(), time: 'Just now' },
    ]);
    setNewComment('');
  };

  return (
    <div className="relative w-full h-screen max-w-md mx-auto bg-[#112925] overflow-hidden select-none font-sans text-white">
      {/* Full-bleed Vertical Video / Animated Backdrop */}
      <div className="absolute inset-0 z-0">
        <svg
          viewBox="0 0 360 780"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Deep Forest Canyon Backdrop */}
          <rect width="360" height="780" fill="#132E2A" />

          {/* Jungle Trees Foliage - Left Clusters */}
          <circle cx="10" cy="240" r="60" fill="#1B4239" />
          <circle cx="20" cy="360" r="70" fill="#225347" />
          <circle cx="-10" cy="500" r="75" fill="#1B4239" />
          <circle cx="30" cy="620" r="65" fill="#275E51" />

          {/* Jungle Trees Foliage - Right Clusters */}
          <circle cx="350" cy="250" r="60" fill="#1B4239" />
          <circle cx="340" cy="380" r="75" fill="#225347" />
          <circle cx="360" cy="520" r="70" fill="#1B4239" />
          <circle cx="330" cy="630" r="65" fill="#275E51" />

          {/* Central Cascading Waterfall Stream */}
          <rect
            x="130"
            y="0"
            width="100"
            height="620"
            fill="#8BA7A3"
            opacity="0.9"
          />

          {/* Vertical Shimmering Torrents */}
          <line
            x1="150"
            y1="0"
            x2="150"
            y2="610"
            stroke="#769490"
            strokeWidth="8"
          />
          <line
            x1="170"
            y1="0"
            x2="170"
            y2="620"
            stroke="#9EBCB8"
            strokeWidth="10"
          />
          <line
            x1="190"
            y1="0"
            x2="190"
            y2="615"
            stroke="#769490"
            strokeWidth="8"
          />
          <line
            x1="210"
            y1="0"
            x2="210"
            y2="610"
            stroke="#9EBCB8"
            strokeWidth="7"
          />

          {/* High Altitude Birds */}
          <path
            d="M125 110 C128 106 133 106 136 110 C139 106 144 106 147 110"
            stroke="#132E2A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M155 88 C158 84 163 84 166 88 C169 84 174 84 177 88"
            stroke="#132E2A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Turquoise Lagoon Pool at Base */}
          <rect y="600" width="360" height="180" fill="#2A5C6F" />
          <ellipse
            cx="180"
            cy="615"
            rx="90"
            ry="25"
            fill="#87B0BA"
            opacity="0.75"
          />
          <ellipse
            cx="260"
            cy="650"
            rx="60"
            ry="14"
            fill="#4F8394"
            opacity="0.6"
          />
          <ellipse
            cx="100"
            cy="660"
            rx="60"
            ry="14"
            fill="#4F8394"
            opacity="0.6"
          />
        </svg>

        {/* Gradient dark overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Top Header Overlay */}
      <div className="relative z-10 px-5 pt-8 pb-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow">
            Travel Reels
          </h1>

          <button
            type="button"
            onClick={() => onNavigate('reel-scan')}
            className="bg-[#E45334] hover:bg-[#D04526] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('for_you')}
            className={`text-sm font-bold pb-1 transition-all relative ${
              activeTab === 'for_you' ? 'text-white' : 'text-white/70'
            }`}
          >
            For you
            {activeTab === 'for_you' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E45334] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`text-sm font-bold pb-1 transition-all relative ${
              activeTab === 'following' ? 'text-white' : 'text-white/70'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E45334] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('near_you')}
            className={`text-sm font-bold pb-1 transition-all relative ${
              activeTab === 'near_you' ? 'text-white' : 'text-white/70'
            }`}
          >
            Near you
            {activeTab === 'near_you' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E45334] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Right Vertical Action Bar */}
      <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-4">
        {/* Heart / Like Button */}
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isLiked
                ? 'bg-[#E45334] text-white shadow-lg shadow-[#E45334]/40 scale-105'
                : 'bg-black/40 text-white border border-white/20'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-white stroke-none' : ''}`}
            />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {(likeCount / 1000).toFixed(1)}k
          </span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            {currentReel.comments_count}
          </span>
        </button>

        {/* Bookmark / Save */}
        <button
          type="button"
          onClick={() => setIsSaved(!isSaved)}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-black/40 text-white border border-white/20'
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`}
            />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            Save
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-white drop-shadow">
            Share
          </span>
        </button>
      </div>

      {/* Bottom Creator Info & Caption Area */}
      <div className="absolute left-5 right-20 bottom-24 z-10 space-y-2">
        {/* Creator Row */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FEEAE3] text-[#D95338] font-extrabold text-xs flex items-center justify-center shadow-md">
            {currentReel.creator_avatar || 'NK'}
          </div>
          <span className="text-sm font-extrabold text-white drop-shadow">
            {currentReel.creator_handle}
          </span>
          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
              isFollowing
                ? 'bg-white text-[#151E28] border-white'
                : 'bg-white/20 border-white/80 text-white backdrop-blur-xs hover:bg-white/30'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Caption */}
        <p className="text-xs text-white/95 font-medium leading-relaxed drop-shadow line-clamp-2">
          {currentReel.caption}
        </p>

        {/* Location Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="bg-[#122A30]/80 border border-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <MapPin className="w-3 h-3 text-[#E45334]" />
            <span>Tegallalang</span>
          </span>
          <span className="bg-[#122A30]/80 border border-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <MapPin className="w-3 h-3 text-[#E45334]" />
            <span>Tibumana Falls</span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('reel-scan')}
            className="bg-[#122A30]/80 border border-white/20 text-white/80 text-[11px] font-medium px-2 py-1 rounded-full backdrop-blur-xs hover:text-white"
          >
            +3 more
          </button>
        </div>
      </div>

      {/* Floating AI Itinerary Pill at very bottom */}
      <div className="absolute left-4 right-4 bottom-4 z-20">
        <div className="bg-white rounded-3xl p-3 px-4 flex items-center justify-between shadow-2xl border border-white/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#FDEEE9] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#D95338]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-[#151E28] block truncate">
                5 places detected
              </span>
              <span className="text-[10px] text-[#7A8699] font-medium block truncate">
                Plannr can turn this reel into a trip
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('reel-scan')}
            className="flex-shrink-0 bg-[#D95338] hover:bg-[#C9472D] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all ml-2"
          >
            Get itinerary
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#151E28]/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Reel link copied to clipboard!</span>
        </div>
      )}

      {/* Sliding Comments Drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-[#FAF7F2] text-[#151E28] rounded-t-3xl shadow-2xl p-5 border-t border-[#EDE7DF] max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE7DF]">
            <h3 className="text-base font-extrabold text-[#151E28]">
              Comments ({commentsList.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="p-1 rounded-full hover:bg-[#EDE7DF] text-[#7A8699]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {commentsList.map((cmt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-full bg-[#151E28] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {cmt.user.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#151E28]">
                      {cmt.user}
                    </span>
                    <span className="text-[10px] text-[#7A8699]">
                      {cmt.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] font-medium mt-0.5">
                    {cmt.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white border border-[#EDE7DF] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#D95338]"
            />
            <button
              type="submit"
              className="bg-[#D95338] text-white p-2 rounded-xl hover:bg-[#C9472D] active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TravelReelsScreen;
