import React from 'react';
import { Home, Calendar, Sparkles, Film, Wallet } from 'lucide-react';
import { PlannrScreen } from './types';

interface PlannrBottomNavProps {
  currentScreen: PlannrScreen;
  onNavigate: (screen: PlannrScreen) => void;
}

export const PlannrBottomNav: React.FC<PlannrBottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const isHome = currentScreen === 'home';
  const isTrips = currentScreen === 'itinerary' || currentScreen === 'group';
  const isReels = currentScreen === 'reels';
  const isWallet = currentScreen === 'checkout';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE7DF] px-4 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around relative">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isHome ? 'text-[#D95338]' : 'text-[#7A8699] hover:text-[#151E28]'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] mt-1 ${isHome ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
        </button>

        {/* Trips */}
        <button
          type="button"
          onClick={() => onNavigate('itinerary')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isTrips ? 'text-[#D95338]' : 'text-[#7A8699] hover:text-[#151E28]'
          }`}
        >
          <Calendar className={`w-5 h-5 ${isTrips ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] mt-1 ${isTrips ? 'font-bold' : 'font-medium'}`}>
            Trips
          </span>
        </button>

        {/* Center Floating Action Button (FAB) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onNavigate('plan-ai')}
            aria-label="Plan with AI"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D95338] to-[#E86145] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(217,83,56,0.42)] active:scale-95 hover:scale-105 transition-all focus:outline-none ring-4 ring-[#FAF7F2]"
          >
            <Sparkles className="w-6 h-6 fill-white stroke-none" />
          </button>
        </div>

        {/* Reels */}
        <button
          type="button"
          onClick={() => onNavigate('reels')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isReels ? 'text-[#D95338]' : 'text-[#7A8699] hover:text-[#151E28]'
          }`}
        >
          <Film className={`w-5 h-5 ${isReels ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] mt-1 ${isReels ? 'font-bold' : 'font-medium'}`}>
            Reels
          </span>
        </button>

        {/* Wallet */}
        <button
          type="button"
          onClick={() => onNavigate('checkout')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            isWallet ? 'text-[#D95338]' : 'text-[#7A8699] hover:text-[#151E28]'
          }`}
        >
          <Wallet className={`w-5 h-5 ${isWallet ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] mt-1 ${isWallet ? 'font-bold' : 'font-medium'}`}>
            Wallet
          </span>
        </button>
      </div>
    </nav>
  );
};
