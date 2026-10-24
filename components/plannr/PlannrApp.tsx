'use client';

import React from 'react';
import { PlannrScreen } from './types';
import { PlannrProvider, usePlannr } from '@/lib/plannr-context';
import HomeScreen from './HomeScreen';
import PlanWithAiScreen from './PlanWithAiScreen';
import ReelToItineraryScreen from './ReelToItineraryScreen';
import TravelReelsScreen from './TravelReelsScreen';
import { ItineraryTimelineScreen } from './ItineraryTimelineScreen';
import { GroupCollabScreen } from './GroupCollabScreen';
import { TripCheckoutScreen } from './TripCheckoutScreen';
import { AddStopModal } from './AddStopModal';
import { GroupChatModal } from './GroupChatModal';
import { InviteTravelerModal } from './InviteTravelerModal';
import { BookingConfirmedModal } from './BookingConfirmedModal';
import { PlannrBottomNav } from './PlannrBottomNav';

interface PlannrAppContentProps {
  onExitToOrbit?: () => void;
}

const PlannrAppContent: React.FC<PlannrAppContentProps> = ({ onExitToOrbit }) => {
  const { currentScreen, screenData, navigate, setActiveTrip, toastMessage, toastType } = usePlannr();

  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'itinerary' ||
    currentScreen === 'group' ||
    currentScreen === 'checkout';

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans antialiased text-[#151E28] relative">
      {/* Top Banner to switch back to Orbit Travel Hub */}
      {onExitToOrbit && (
        <div className="bg-[#151E28] text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D95338]" />
            <span className="font-extrabold tracking-tight">Plannr AI Studio</span>
          </div>

          <button
            type="button"
            onClick={onExitToOrbit}
            className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold px-3 py-1 rounded-full text-[11px] transition-all flex items-center gap-1.5"
          >
            <span>✈️ Orbit Travel Hub</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Screen 1: Home Screen */}
      {currentScreen === 'home' && (
        <HomeScreen onNavigate={navigate} />
      )}

      {/* Screen 2: Plan with AI */}
      {currentScreen === 'plan-ai' && (
        <PlanWithAiScreen
          onNavigate={navigate}
          initialIdea={screenData?.initialIdea}
          onTripGenerated={(trip) => setActiveTrip(trip)}
        />
      )}

      {/* Screen 3: Reel → Itinerary */}
      {currentScreen === 'reel-scan' && (
        <ReelToItineraryScreen
          onNavigate={navigate}
          onItineraryBuilt={(trip) => setActiveTrip(trip)}
        />
      )}

      {/* Screen 4: Dynamic Custom Itinerary Screen */}
      {currentScreen === 'itinerary' && (
        <ItineraryTimelineScreen onNavigate={navigate} />
      )}

      {/* Screen 5: Group Collaboration & Live Voting */}
      {currentScreen === 'group' && (
        <GroupCollabScreen onNavigate={navigate} />
      )}

      {/* Screen 6: Split & Settle Checkout */}
      {currentScreen === 'checkout' && (
        <TripCheckoutScreen onNavigate={navigate} />
      )}

      {/* Screen 7: Travel Reels Feed */}
      {currentScreen === 'reels' && (
        <TravelReelsScreen onNavigate={navigate} />
      )}

      {/* Modals & Overlays */}
      <AddStopModal />
      <GroupChatModal />
      <InviteTravelerModal />
      <BookingConfirmedModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#151E28] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 animate-slide-down">
          <div
            className={`w-2 h-2 rounded-full ${
              toastType === 'success'
                ? 'bg-emerald-400'
                : toastType === 'error'
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          />
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Bottom Nav Bar for main views */}
      {showBottomNav && (
        <PlannrBottomNav currentScreen={currentScreen} onNavigate={navigate} />
      )}
    </div>
  );
};

interface PlannrAppProps {
  initialScreen?: PlannrScreen;
  onExitToOrbit?: () => void;
}

export const PlannrApp: React.FC<PlannrAppProps> = ({
  initialScreen = 'home',
  onExitToOrbit,
}) => {
  return (
    <PlannrProvider initialScreen={initialScreen}>
      <PlannrAppContent onExitToOrbit={onExitToOrbit} />
    </PlannrProvider>
  );
};

export default PlannrApp;
