
import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';
import ProfileCard from './ProfileCard';
import { Heart, X, RotateCcw, Sparkles } from 'lucide-react';

interface DiscoveryProps {
  profiles: UserProfile[];
  onMatch: (profileId: string) => void;
}

const Discovery: React.FC<DiscoveryProps> = ({ profiles, onMatch }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState<'like' | 'dislike' | null>(null);

  // Reset index if profiles change drastically (e.g., when filtering)
  useEffect(() => {
    setCurrentIndex(0);
  }, [profiles.length]);

  const handleSwipe = useCallback((direction: 'like' | 'dislike') => {
    if (currentIndex >= profiles.length || isAnimating) return;

    setIsAnimating(direction);
    
    setTimeout(() => {
      if (direction === 'like') {
        onMatch(profiles[currentIndex].id);
      }
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(null);
    }, 500);
  }, [currentIndex, isAnimating, onMatch, profiles]);

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center px-6">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {profiles.length === 0 ? "No matches found" : "You've seen everyone!"}
        </h3>
        <p className="text-gray-500 mb-8">
          {profiles.length === 0 
            ? "Try adjusting your preferences to see more people." 
            : "Try expanding your preferences to meet more people in your area."}
        </p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="flex items-center space-x-2 text-rose-500 font-semibold hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset Discovery</span>
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto p-4">
      <div className={`relative transition-all duration-500 transform 
        ${isAnimating === 'like' ? 'translate-x-[150%] rotate-12 opacity-0' : ''}
        ${isAnimating === 'dislike' ? '-translate-x-[150%] -rotate-12 opacity-0' : ''}
      `}>
        <ProfileCard profile={currentProfile} />
        
        {isAnimating === 'like' && (
          <div className="absolute top-10 left-10 border-4 border-emerald-500 text-emerald-500 font-black text-4xl px-4 py-2 rounded-lg rotate-[-20deg] z-50">
            LIKE
          </div>
        )}
        {isAnimating === 'dislike' && (
          <div className="absolute top-10 right-10 border-4 border-rose-500 text-rose-500 font-black text-4xl px-4 py-2 rounded-lg rotate-[20deg] z-50">
            NOPE
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-6 mt-8">
        <button 
          onClick={() => handleSwipe('dislike')}
          className="p-4 bg-white rounded-full shadow-lg text-rose-500 hover:scale-110 active:scale-95 transition-all border border-rose-50"
        >
          <X className="w-8 h-8" />
        </button>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="p-3 bg-white rounded-full shadow-lg text-amber-500 hover:scale-110 active:scale-95 transition-all border border-amber-50"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleSwipe('like')}
          className="p-4 bg-white rounded-full shadow-lg text-emerald-500 hover:scale-110 active:scale-95 transition-all border border-emerald-50"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default Discovery;
