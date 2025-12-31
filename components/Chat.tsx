
import React, { useState, useEffect, useRef } from 'react';
import { Match, Message } from '../types';
import { CURRENT_USER } from '../constants';
import { Send, ArrowLeft, Sparkles, MapPin, Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { getIceBreaker, getDatePlanner, connectLiveChat } from '../services/geminiService';

interface ChatProps {
  match: Match;
  onBack: () => void;
  onSendMessage: (matchId: string, text: string) => void;
}

// Audio Utils
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Chat: React.FC<ChatProps> = ({ match, onBack, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<{ sender: string, text: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [match.messages, transcription, isLiveMode]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(match.id, inputText);
    setInputText('');
    setAiSuggestion(null);
  };

  const generateIceBreaker = async () => {
    setIsAiLoading(true);
    const suggestion = await getIceBreaker(CURRENT_USER, match.user);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  const generateDateIdea = async () => {
    setIsAiLoading(true);
    const idea = await getDatePlanner(match.user.name, match.user.interests);
    setAiSuggestion(`Date Idea: ${idea}`);
    setIsAiLoading(false);
  };

  const startLiveMode = async () => {
    try {
      setIsLiveMode(true);
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outputCtx;
      inputAudioContextRef.current = inputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = connectLiveChat(match.user, {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message: any) => {
          // Handle Audio
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          // Handle Transcriptions
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => {
              const last = prev[prev.length - 1];
              if (last && last.sender === match.user.name) {
                return [...prev.slice(0, -1), { ...last, text: last.text + message.serverContent.outputTranscription.text }];
              }
              return [...prev, { sender: match.user.name, text: message.serverContent.outputTranscription.text }];
            });
          } else if (message.serverContent?.inputTranscription) {
             setTranscription(prev => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'You') {
                return [...prev.slice(0, -1), { ...last, text: last.text + message.serverContent.inputTranscription.text }];
              }
              return [...prev, { sender: 'You', text: message.serverContent.inputTranscription.text }];
            });
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => endLiveMode(),
        onerror: (e: any) => console.error("Live Error", e),
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsLiveMode(false);
    }
  };

  const endLiveMode = () => {
    if (sessionRef.current) {
      // sessionRef.current.close() is handled by SDK but we can cleanup
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    setIsLiveMode(false);
    setTranscription([]);
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-lg mx-auto shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center ml-2 flex-1">
          <img src={match.user.images[0]} alt={match.user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
          <div className="ml-3">
            <h3 className="font-bold text-gray-800 leading-none">{match.user.name}</h3>
            <span className="text-xs text-emerald-500 font-medium">{isLiveMode ? 'Live Now' : 'Online'}</span>
          </div>
        </div>
        <button 
          onClick={isLiveMode ? endLiveMode : startLiveMode}
          className={`p-2 rounded-full transition-all ${isLiveMode ? 'bg-rose-100 text-rose-500 animate-pulse' : 'hover:bg-gray-100 text-rose-500'}`}
        >
          {isLiveMode ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50 relative">
        {!isLiveMode ? (
          <>
            {match.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-rose-400" />
                </div>
                <p className="text-gray-500 text-sm max-w-[200px]">
                  You matched! Use AI to start the conversation with something unique.
                </p>
              </div>
            )}
            
            {match.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === 'me' 
                  ? 'bg-rose-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {aiSuggestion && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-2xl shadow-sm max-w-[90%]">
                  <div className="flex items-center text-indigo-600 mb-2 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggestion
                  </div>
                  <p className="text-sm text-gray-700 italic">"{aiSuggestion}"</p>
                  <button 
                    onClick={() => setInputText(aiSuggestion)}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Use this suggestion
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center h-full pt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
              <img src={match.user.images[0]} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Talking with {match.user.name}</h2>
            <p className="text-rose-500 text-sm font-semibold mb-8 flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
              Real-time WebSocket Live
            </p>

            <div className="w-full space-y-3 bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/50 min-h-[200px]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Transcription</div>
              {transcription.map((t, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold text-gray-700">{t.sender}:</span> 
                  <span className="ml-2 text-gray-600 italic">"{t.text}"</span>
                </div>
              ))}
              {transcription.length === 0 && (
                <div className="text-gray-400 text-sm italic">Say something to start the real-time chat...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Area */}
      {!isLiveMode ? (
        <>
          <div className="px-4 py-2 bg-slate-50 border-t flex gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={generateIceBreaker}
              disabled={isAiLoading}
              className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ice Breaker</span>
            </button>
            <button 
              onClick={generateDateIdea}
              disabled={isAiLoading}
              className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-white border border-rose-100 rounded-full text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-50"
            >
              <MapPin className="w-3 h-3" />
              <span>Plan Date</span>
            </button>
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-1 text-rose-500 disabled:text-gray-400 hover:scale-110 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 bg-white border-t flex items-center justify-around">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full shadow-lg transition-all ${isMuted ? 'bg-gray-100 text-gray-400' : 'bg-rose-50 text-rose-500'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button 
            onClick={endLiveMode}
            className="p-5 bg-rose-500 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
          <div className="p-4 rounded-full bg-rose-50 text-rose-500 shadow-lg">
            <Volume2 className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
