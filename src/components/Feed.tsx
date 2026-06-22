import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Heart, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Share2, 
  Tag, 
  BookmarkCheck,
  Compass
} from 'lucide-react';
import { Poem } from '../types';
import { supabase } from '../lib/supabase';

interface FeedProps {
  poems: Poem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBackToSplash: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function Feed({ 
  poems, 
  loading, 
  error, 
  onRetry, 
  onBackToSplash,
  selectedCategory,
  setSelectedCategory
}: FeedProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefreshAll = () => {
    onRetry();
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fragments_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Audio state
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Active Reading Modal
  const [activeReadingPoem, setActiveReadingPoem] = useState<Poem | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fragments_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn("Could not save favorites to localStorage", e);
    }
  }, [favorites]);

  // Handle TTS
  const handleSpeak = (poem: Poem) => {
    if (!synth) return;

    if (activeVoiceId === poem.id) {
      synth.cancel();
      setActiveVoiceId(null);
      setCurrentUtterance(null);
      return;
    }

    synth.cancel(); // Stop any current dialogue
    const textToRead = `${poem.title}. Written by ${poem.author}. \n\n ${poem.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Choose a high quality warm voice if possible
    const voices = synth.getVoices();
    const systemVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                        voices.find(v => v.lang.startsWith('en')) || 
                        voices[0];
    if (systemVoice) {
      utterance.voice = systemVoice;
    }
    
    utterance.volume = 0.9;
    utterance.rate = 0.85; // slightly slower for emotional pacing
    utterance.pitch = 0.95; // warmer pitch

    utterance.onend = () => {
      setActiveVoiceId(null);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setActiveVoiceId(null);
      setCurrentUtterance(null);
    };

    setActiveVoiceId(poem.id);
    setCurrentUtterance(utterance);
    synth.speak(utterance);
  };

  // Handle Copy to Clipboard
  const handleCopy = (poem: Poem) => {
    const text = `"${poem.title}"\nBy ${poem.author}\n\n${poem.content}\n\n-- Found on Fragments of Soul`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(poem.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  // Toggle favorite status
  const toggleFavorite = (poemId: string) => {
    setFavorites(prev => 
      prev.includes(poemId) ? prev.filter(id => id !== poemId) : [...prev, poemId]
    );
  };

  // Extract all categories dynamically from fetched poems
  const feedSource = poems;

  const categories = ['All', 'Favorites', ...Array.from(new Set(
    feedSource
      .map(p => p.category)
      .filter((cat): cat is string => Boolean(cat))
  ))] as string[];

  // Filtering logic
  const filteredPoems = feedSource.filter(poem => {
    const matchesSearch = 
      poem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      poem.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      poem.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Favorites') return matchesSearch && favorites.includes(poem.id);
    return matchesSearch && poem.category === selectedCategory;
  });

  return (
    <div className="relative min-h-screen bg-[#050b1a] text-[#E2E8F0] pb-28 md:pb-24">
      {/* Background Mesh Gradients from the Frosted Glass Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-800/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        
        {/* Top Header Row with Frosted Glass Aesthetics */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-b border-white/5 relative z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToSplash}
              id="back-to-splash-button"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 transition-all text-slate-300 hover:text-white group cursor-pointer shadow-lg backdrop-blur-sm"
              title="Return to Splash Screen"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-white flex items-center gap-2">
                Fragments <span className="italic font-normal text-indigo-300">of</span> Soul
              </h2>
              <p className="text-xs text-slate-400 font-sans tracking-wider">Poetic healing feed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live content indicator badge from the Frosted Glass Design */}
            <span className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-inner shadow-emerald-500/5 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="tracking-widest text-[9px] uppercase font-bold">LIVE CONTENT FEED</span>
            </span>

            {/* Quick Refresh Icon */}
            <button 
              onClick={handleRefreshAll}
              disabled={loading}
              className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 transition-all text-slate-300 cursor-pointer ${loading ? 'animate-spin' : ''} shadow-lg backdrop-blur-sm`}
              title="Refresh Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic State Control: Loading */}
        {loading && (
          <div className="py-24 flex flex-col justify-center items-center space-y-4">
            <div className="relative w-12 h-12 flex justify-center items-center">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
              <Compass className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-serif italic text-lg text-indigo-300">Unveiling deeper feelings...</p>
              <p className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">Connecting to Supabase Database</p>
            </div>
          </div>
        )}

        {/* Dynamic State Control: Network / Loading Error */}
        {error && !loading && (
          <div className="my-12 py-10 px-8 bg-white/5 border border-white/10 rounded-3xl max-w-xl mx-auto text-center space-y-5 relative z-10 backdrop-blur-md shadow-2xl">
            <div className="w-12 h-12 mx-auto bg-red-950/30 text-red-400 rounded-full flex items-center justify-center border border-red-500/20 animate-bounce">
              <VolumeX className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl text-white">The Voice Remains Silent</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <button 
              onClick={handleRefreshAll}
              className="px-6 py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/35 text-white border border-white/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Normal Loaded State content */}
        {!loading && !(error && feedSource.length === 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pt-6 z-10 relative"
          >
            {/* Search & Categories Navigation Grid */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search input container in dynamic glass */}
              <div className="relative w-full md:max-w-xs group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search fragment or writer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/25 outline-none rounded-2xl text-sm font-sans transition-all text-white placeholder-slate-500 shadow-inner backdrop-blur-sm"
                />
              </div>

              {/* Dynamic filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 no-scrollbar justify-start md:justify-end">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-2xl text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer backdrop-blur-sm ${
                      selectedCategory === category 
                        ? 'bg-white/20 border border-white/25 text-white shadow-lg' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {category === 'Favorites' ? `★ Saved (${favorites.length})` : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty filter message */}
            {filteredPoems.length === 0 && (
              <div className="py-20 text-center space-y-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="space-y-1">
                  <p className="font-serif italic text-slate-300 text-lg">A quiet space here</p>
                  <p className="text-xs text-slate-500 font-mono">No fragments match search selection.</p>
                </div>
              </div>
            )}

            {/* List of elements from Frosted Glass Mockup */}
            <div className="space-y-8 pb-12">
              {filteredPoems.map((poem, index) => {
                const isFavorite = favorites.includes(poem.id);
                const isVoiceActive = activeVoiceId === poem.id;

                return (
                  <motion.article 
                    key={poem.id}
                    id={`poem-card-${poem.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.6 }}
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                  >
                    {/* Background Soft Glow on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 group-hover:via-indigo-500/[0.01] rounded-3xl transition-all pointer-events-none duration-500" />

                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {poem.category && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 text-blue-300 rounded-md text-[10px] uppercase font-mono tracking-widest border border-white/10">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{poem.category}</span>
                          </div>
                        )}
                        <h3 className="text-xl sm:text-2xl font-serif text-slate-100 tracking-wide leading-tight group-hover:text-white transition-colors truncate">
                          {poem.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans tracking-wide">
                          by <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{poem.author}</span>
                        </p>
                      </div>

                      {/* Action buttons list */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Audio Speak Control */}
                        {synth && (
                          <button
                            onClick={() => handleSpeak(poem)}
                            className={`p-2 rounded-xl transition-all border cursor-pointer ${
                              isVoiceActive 
                                ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 animate-pulse' 
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                            }`}
                            title={isVoiceActive ? "Mute Poem" : "Listen Poem"}
                          >
                            {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Copy Code Button */}
                        <button
                          onClick={() => handleCopy(poem)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer ${
                            copiedId === poem.id 
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                          }`}
                          title="Copy Poem Text"
                        >
                          {copiedId === poem.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Favorite Heart Button */}
                        <button
                          onClick={() => toggleFavorite(poem.id)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer ${
                            isFavorite 
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-rose-400'
                          }`}
                          title={isFavorite ? "Remove favorite" : "Save favorite"}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* Immersive Reading Modal button */}
                        <button
                          onClick={() => setActiveReadingPoem(poem)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-indigo-300 transition-all cursor-pointer"
                          title="Full Immersive Screen"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Separator from Mockup line structure */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-5" />

                    {/* Poetry Verse Block */}
                    <div className="pl-3 sm:pl-5 border-l-2 border-white/10 hover:border-white/20 transition-all duration-300 space-y-4">
                      {poem.imageUrl && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 max-h-[350px] flex justify-center items-center group/img">
                          <img 
                            src={poem.imageUrl} 
                            alt={poem.title} 
                            referrerPolicy="no-referrer"
                            className="max-h-[350px] object-contain w-full transition-transform duration-500 group-hover/img:scale-[1.02]"
                            onError={(e) => {
                              // Hide image on error to keep the feed clean
                              (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <p className="text-slate-100 font-serif whitespace-pre-line text-[17px] sm:text-lg leading-relaxed tracking-wide italic select-all py-1">
                        "{poem.content}"
                      </p>
                    </div>

                    {/* Card Footer Info */}
                    <div className="mt-6 flex flex-wrap gap-2 items-center justify-between">
                      {poem.tags && poem.tags.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {poem.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="text-[10px] font-mono font-medium text-blue-400/80 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : <div />}

                      {poem.date && (
                        <time className="text-[10px] font-mono text-slate-500 italic tracking-wider">
                          {poem.date}
                        </time>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Overlay Full Immersive Reading Modal with Enhanced Glass */}
      <AnimatePresence>
        {activeReadingPoem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 backdrop-blur-xl"
          >
            {/* Background elements */}
            <div className="absolute top-10 left-10 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl bg-[#0a1229]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal header with back button */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Immersive Reader</span>
                </div>
                <button 
                  onClick={() => setActiveReadingPoem(null)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Content Scroll */}
              <div className="flex-1 overflow-y-auto py-8 text-center px-2 sm:px-6">
                <span className="text-xs text-blue-400 font-mono tracking-widest uppercase mb-2 block">
                  {activeReadingPoem.category || "Fragment"}
                </span>
                
                <h3 className="text-3xl md:text-4xl font-serif text-white tracking-wide mb-2">
                  {activeReadingPoem.title}
                </h3>
                
                <p className="text-sm text-slate-400 tracking-wide mb-8">
                  by <span className="font-semibold text-slate-200">{activeReadingPoem.author}</span>
                </p>

                {/* Elegant central separator line */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  <div className="w-12 h-[1px] bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                </div>

                <div className="max-w-md mx-auto space-y-6">
                  {activeReadingPoem.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/50 max-h-[250px] flex justify-center items-center">
                      <img 
                        src={activeReadingPoem.imageUrl} 
                        alt={activeReadingPoem.title} 
                        referrerPolicy="no-referrer"
                        className="max-h-[250px] object-contain w-full"
                      />
                    </div>
                  )}
                  <p className="text-xl md:text-2xl font-serif italic text-slate-100 whitespace-pre-line leading-relaxed tracking-wider antialiased select-all">
                    "{activeReadingPoem.content}"
                  </p>
                </div>
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
                <span>{activeReadingPoem.date || "Timeless"}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(activeReadingPoem)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === activeReadingPoem.id ? 'Copied' : 'Copy'}</span>
                  </button>
                  {synth && (
                    <button
                      onClick={() => handleSpeak(activeReadingPoem)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      {activeVoiceId === activeReadingPoem.id ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{activeVoiceId === activeReadingPoem.id ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
