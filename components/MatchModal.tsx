
import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, MessageCircle, X } from 'lucide-react';

interface MatchModalProps {
  user: UserProfile;
  match: UserProfile;
  onClose: () => void;
  onChat: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ user, match, onClose, onChat }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/20 backdrop-blur-md rounded-full text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center bg-gradient-to-b from-rose-500 to-rose-600 text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-rose-200" />
          <h2 className="text-3xl font-black mb-1">IT'S A MATCH!</h2>
          <p className="text-rose-100 font-medium">You and {match.name} liked each other.</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center -space-x-8 mb-10">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden transform -rotate-6">
              <img src={user.images[0]} alt="You" className="w-full h-full object-cover" />
            </div>
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden transform rotate-6 scale-110 z-10">
              <img src={match.images[0]} alt={match.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onChat}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>SEND A MESSAGE</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
            >
              KEEP SWIPING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
