
import React, { useState, useMemo } from 'react';
import { UserProfile, Match, Message, UserPreferences } from './types';
import { MOCK_PROFILES, CURRENT_USER } from './constants';
import Discovery from './components/Discovery';
import Chat from './components/Chat';
import MatchModal from './components/MatchModal';
import { Sparkles, MessageSquare, User, Home, Settings, Sliders, MapPin } from 'lucide-react';

type Tab = 'discovery' | 'messages' | 'profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('discovery');
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    ageRange: [18, 50],
    maxDistance: 50,
    interests: []
  });

  const filteredProfiles = useMemo(() => {
    return MOCK_PROFILES.filter(profile => {
      // Age filter
      if (profile.age < preferences.ageRange[0] || profile.age > preferences.ageRange[1]) return false;
      
      // Distance filter
      const distance = parseInt(profile.distance.split(' ')[0]);
      if (distance > preferences.maxDistance) return false;
      
      // Interests filter (if user has selected preferred interests, match at least one)
      if (preferences.interests.length > 0) {
        const hasCommonInterest = profile.interests.some(interest => 
          preferences.interests.includes(interest)
        );
        if (!hasCommonInterest) return false;
      }
      
      // Don't show already matched profiles
      if (matches.some(m => m.user.id === profile.id)) return false;

      return true;
    });
  }, [preferences, matches]);

  const handleMatch = (profileId: string) => {
    const matchedProfile = MOCK_PROFILES.find(p => p.id === profileId);
    if (matchedProfile) {
      const existingMatch = matches.find(m => m.user.id === matchedProfile.id);
      if (!existingMatch) {
        const matchObj: Match = {
          id: Date.now().toString(),
          user: matchedProfile,
          messages: []
        };
        setMatches(prev => [matchObj, ...prev]);
        setNewMatch(matchedProfile);
      }
    }
  };

  const handleSendMessage = (matchId: string, text: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const newMsg: Message = {
          id: Date.now().toString(),
          senderId: 'me',
          text,
          timestamp: Date.now()
        };
        return {
          ...m,
          messages: [...m.messages, newMsg],
          lastMessage: text
        };
      }
      return m;
    }));
  };

  const activeMatch = matches.find(m => m.id === activeChatId);

  const toggleInterestPreference = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Collect all unique interests from mock profiles for the filter UI
  const allAvailableInterests = useMemo(() => {
    const set = new Set<string>();
    MOCK_PROFILES.forEach(p => p.interests.forEach(i => set.add(i)));
    return Array.from(set);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-slate-50 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Amora AI</h1>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Sliders className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'discovery' && (
          <div className="h-full flex flex-col justify-center">
            <Discovery profiles={filteredProfiles} onMatch={handleMatch} />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="h-full overflow-y-auto px-6 py-4 no-scrollbar">
            <h2 className="text-xl font-bold mb-6">New Matches</h2>
            <div className="flex space-x-4 mb-8 overflow-x-auto no-scrollbar pb-2">
              {matches.filter(m => m.messages.length === 0).map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveChatId(m.id)}
                  className="flex-shrink-0 cursor-pointer text-center group"
                >
                  <div className="relative">
                    <img 
                      src={m.user.images[0]} 
                      alt={m.user.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 p-0.5 group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-semibold mt-2 block text-gray-700">{m.user.name}</span>
                </div>
              ))}
              {matches.filter(m => m.messages.length === 0).length === 0 && (
                <p className="text-gray-400 text-sm">No new matches yet. Keep swiping!</p>
              )}
            </div>

            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="space-y-4">
              {matches.filter(m => m.messages.length > 0).map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveChatId(m.id)}
                  className="flex items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <img src={m.user.images[0]} alt={m.user.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{m.user.name}</h3>
                      <span className="text-[10px] text-gray-400 font-medium">Recently</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {m.messages[m.messages.length - 1]?.text || 'Start a conversation...'}
                    </p>
                  </div>
                </div>
              ))}
              {matches.filter(m => m.messages.length > 0).length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <p>Send a message to your matches to see them here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="h-full overflow-y-auto px-6 py-4 no-scrollbar">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img src={CURRENT_USER.images[0]} alt="Me" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" />
                <button className="absolute bottom-0 right-0 p-2 bg-rose-500 rounded-full text-white shadow-lg border-2 border-white">
                  <User className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold mt-4">{CURRENT_USER.name}, {CURRENT_USER.age}</h2>
              <p className="text-gray-500">{CURRENT_USER.jobTitle}</p>
            </div>

            {/* Preferences Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <Sliders className="w-4 h-4 mr-2 text-rose-500" />
                  Discovery Preferences
                </h3>
              </div>

              {/* Age Range */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Age Range</label>
                  <span className="text-xs font-bold text-rose-500">{preferences.ageRange[0]} - {preferences.ageRange[1]}</span>
                </div>
                <input 
                  type="range" 
                  min="18" 
                  max="60" 
                  value={preferences.ageRange[1]}
                  onChange={(e) => setPreferences(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(e.target.value)] }))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Distance */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Maximum Distance</label>
                  <span className="text-xs font-bold text-rose-500">{preferences.maxDistance} miles</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={preferences.maxDistance}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="w-full accent-rose-500"
                />
              </div>

              {/* Interests Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3 text-center">Interested In (Optional)</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allAvailableInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterestPreference(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        preferences.interests.includes(interest)
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-105'
                        : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h3 className="font-bold mb-4 flex items-center text-gray-800">
                <Sparkles className="w-4 h-4 text-indigo-500 mr-2" />
                AI Bio Enhancements
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl text-sm text-gray-600 border border-slate-100 italic">
                  "Tech lover with a passion for coding and high-fives. Looking for my co-founder in life."
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-sm text-gray-600 border border-slate-100 italic">
                  "I'm 80% coffee, 20% bad jokes. Swipe right if you can handle both."
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Overlay */}
        {activeChatId && activeMatch && (
          <div className="absolute inset-0 z-50 animate-in slide-in-from-right duration-300">
            <Chat 
              match={activeMatch} 
              onBack={() => setActiveChatId(null)}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <nav className="h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-10 sticky bottom-0">
        <button 
          onClick={() => { setActiveTab('discovery'); setActiveChatId(null); }}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'discovery' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Discover</span>
        </button>
        <button 
          onClick={() => { setActiveTab('messages'); setActiveChatId(null); }}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'messages' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {matches.some(m => m.messages.length === 0) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Chats</span>
        </button>
        <button 
          onClick={() => { setActiveTab('profile'); setActiveChatId(null); }}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'profile' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Modals */}
      {newMatch && (
        <MatchModal 
          user={CURRENT_USER} 
          match={newMatch} 
          onClose={() => setNewMatch(null)} 
          onChat={() => {
            const m = matches.find(m => m.user.id === newMatch.id);
            if (m) {
              setActiveChatId(m.id);
              setActiveTab('messages');
              setNewMatch(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
