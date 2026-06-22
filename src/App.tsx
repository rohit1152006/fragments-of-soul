import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PenTool, Users } from 'lucide-react';
import Splash from './components/Splash';
import Feed from './components/Feed';
import CreatePoem from './components/CreatePoem';
import Community from './components/Community';
import { Poem, ScreenState, TabState } from './types';
import { supabase } from './lib/supabase';

// Gorgeous local fallback dataset in case of complete internet offline or CORS issues
const FALLBACK_POEMS: Poem[] = [
  {
    id: "fb-1",
    title: "Echoes of the Silent Forest",
    content: "There is a silent wisdom in the trees,\nThey lose their leaves, yet stand so tall and proud.\nThey whisper stories to the gentle breeze,\nAnd paint their dreams across a passing cloud.\n\nWe too must learn the quiet art of letting go,\nTo trust the seasons when the cold wind blows.\nFor depth is gained beneath the heavy snow,\nAnd in the dark, the quiet spirit grows.",
    author: "Rohit Chandan",
    category: "Healing",
    date: "Jun 12, 2026",
    tags: ["nature", "growth", "patience"]
  },
  {
    id: "fb-2",
    title: "Glass and Moonlight",
    content: "We are all made of cracks and broken glass,\nReflecting light in ways we cannot see.\nWe focus on the shadows as they pass,\nAnd lose the music of our symphony.\n\nBut look closely at the shattered seam,\nWhere darkness meets the silver and the blue.\nEach fracture is a bridge to build a dream,\nCreating patterns beautiful and new.",
    author: "Rohit Chandan",
    category: "Soul",
    date: "May 28, 2026",
    tags: ["hope", "wholeness", "beauty"]
  },
  {
    id: "fb-3",
    title: "The Alchemy of Tears",
    content: "Do not hide the rain behind your eyes,\nFor water has a magic of its own.\nIt washes clean the dust from heavy skies,\nAnd feeds the seeds that have so quiet grown.\n\nTo weep is but to whisper to the ground,\nThat we are human, soft, and beautifully deep.\nAnd in those quiet waters we have found,\nA sacred mirror that our souls can keep.",
    author: "Ananya Sen",
    category: "Melancholy",
    date: "Apr 15, 2026",
    tags: ["expression", "release", "tears"]
  },
  {
    id: "fb-4",
    title: "First Light After Nightfall",
    content: "The darkest hour is an honest friend,\nIt strips away the noise and simple light.\nIt makes us ask where our frontiers end,\nAnd tests our faith within the endless night.\n\nBut look, a golden line begins to trace,\nThe quiet contour of the mountain side.\nMorning arrives with unexpected grace,\nAnd sweeps away the fears we had to hide.",
    author: "Kabir Das",
    category: "Hope",
    date: "Mar 09, 2026",
    tags: ["dawn", "faith", "perspective"]
  }
];

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [activeTab, setActiveTab] = useState<TabState>('feed');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [sharedCategoryFilter, setSharedCategoryFilter] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Robust Normalizer
  const parseFetchedPoetry = useCallback((data: any): Poem[] => {
    if (!data) return [];
    
    // Find the poetry list inside data
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data.poems && Array.isArray(data.poems)) {
      rawList = data.poems;
    } else if (data.data && Array.isArray(data.data)) {
      rawList = data.data;
    } else if (data.content && Array.isArray(data.content)) {
      rawList = data.content;
    } else if (typeof data === 'object') {
      // If single item, wrap it
      rawList = [data];
    }
    
    return rawList.map((item: any, index: number) => {
      // Parse individual fields dynamically
      const id = item.id?.toString() || `poetry-${index}`;
      const title = item.title || item.name || item.subject || `Untitled Fragment #${index + 1}`;
      const author = item.author || item.poet || item.writer || item.by || "Unknown Writer";
      
      let content = "";
      if (typeof item.content === 'string') content = item.content;
      else if (typeof item.poem === 'string') content = item.poem;
      else if (typeof item.body === 'string') content = item.body;
      else if (typeof item.text === 'string') content = item.text;
      else if (Array.isArray(item.lines)) {
        content = item.lines.join('\n');
      } else if (typeof item.lines === 'string') {
        content = item.lines;
      } else if (item.verse) {
        content = typeof item.verse === 'string' ? item.verse : JSON.stringify(item.verse);
      } else {
        // Fallback search
        const longStrings = Object.values(item).filter(v => typeof v === 'string' && v.length > 30);
        content = longStrings.length > 0 ? (longStrings[0] as string) : "No poetry verses found in this data block.";
      }

      const category = item.category || item.tag || item.theme || item.mood || "Spirit";
      const tags = Array.isArray(item.tags) 
        ? item.tags 
        : (item.tags ? [item.tags] : [category.toLowerCase()]);
      const date = item.date || item.created_at || item.published || "Timeless";

      return {
        id,
        title,
        content,
        author,
        category,
        tags,
        date
      };
    });
  }, []);

  // Parse fetched HTML content if the resource is an HTML document (e.g. dump.html)
  const parseHtmlContent = useCallback((htmlText: string, baseUrl: string): Poem[] => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const parsedPoems: Poem[] = [];

      // 1. Try to find any embedded JSON in code/pre/script blocks first
      const codeBlocks = Array.from(doc.querySelectorAll('pre, code, script[type="application/json"]'));
      for (const block of codeBlocks) {
        try {
          const blockText = block.textContent?.trim();
          if (blockText) {
            const parsedJson = JSON.parse(blockText);
            const subParsed = parseFetchedPoetry(parsedJson);
            if (subParsed && subParsed.length > 0) {
              return subParsed;
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      // 2. Extract images as poems (fine for handwritten/visual poems mentioned by the user)
      const images = Array.from(doc.querySelectorAll('img'));
      if (images.length > 0) {
        images.forEach((img, index) => {
          let src = img.getAttribute('src') || '';
          if (src) {
            // Absolute check
            if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
              const cleanSrc = src.replace(/^\/+/, '');
              src = `${baseUrl.replace(/\/+$/, '')}/${cleanSrc}`;
            }
            const title = img.getAttribute('alt')?.trim() || img.getAttribute('title')?.trim() || `Visual Expression #${index + 1}`;
            parsedPoems.push({
              id: `html-image-poem-${index}`,
              title,
              content: `This beautiful poem has been preserved in visual or handwriting format. Touch the reader icon for full resolution.`,
              author: "Rohit",
              category: "Visual Art",
              tags: ["poetry", "soul", "art"],
              imageUrl: src,
              date: "Timeless"
            });
          }
        });
      }

      // 3. Fallback template extraction (getting paragraphs as text)
      if (parsedPoems.length === 0) {
        const paragraphs = Array.from(doc.querySelectorAll('p, blockquote, div.poem, .poem-content'));
        const collectedText: string[] = [];
        paragraphs.forEach((p) => {
          const txt = p.textContent?.trim();
          if (txt && txt.length > 25) {
            collectedText.push(txt);
          }
        });

        if (collectedText.length > 0) {
          collectedText.forEach((text, i) => {
            const lines = text.split('\n').filter(Boolean);
            const title = lines[0]?.slice(0, 40) || `Fragment #${i + 1}`;
            parsedPoems.push({
              id: `html-text-poem-${i}`,
              title,
              content: text,
              author: "Rohit",
              category: "Thought",
              tags: ["mind", "recovery"],
              date: "Timeless"
            });
          });
        }
      }

      return parsedPoems;
    } catch (e) {
      console.error("DOM Parsing failed", e);
      return [];
    }
  }, [parseFetchedPoetry]);

  // API Request Caller - Fully and strictly migrated to Supabase Live Database
  const fetchPoetryFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('poems')
        .select('*')
        .eq('post_type', 'poem')
        .order('created_at', { ascending: false });

      if (sbError) {
        throw sbError;
      }

      if (data && data.length > 0) {
        const mapped: Poem[] = data.map((item: any, index: number) => ({
          id: item.id?.toString() || `supabase-${index}`,
          title: item.title || "Untitled Fragment",
          content: item.content || "",
          author: item.author_name || item.author || "Anonymous Poet",
          category: item.category || "Soul",
          tags: Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : ["soul"]),
          imageUrl: item.image_url || item.imageUrl || undefined,
          date: item.created_at 
            ? new Date(item.created_at).toLocaleString() 
            : "Timeless"
        }));
        setPoems(mapped);
      } else {
        setPoems(FALLBACK_POEMS);
      }
    } catch (err: any) {
      console.warn("Could not fetch poems from live Supabase database", err);
      setError(`Database Connection Warning: ${err.message || String(err)}. Falling back to local offline catalog.`);
      setPoems(FALLBACK_POEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle active loading triggers
  useEffect(() => {
    fetchPoetryFeed();
  }, [fetchPoetryFeed]);

  const handleAddPoem = useCallback(async (newPoem: Poem): Promise<string | null> => {
    // Write the poem row strictly to the Supabase database
    try {
      const { data, error } = await supabase
        .from('poems')
        .insert([
          {
            title: newPoem.title,
            content: newPoem.content,
            author_name: newPoem.author,
            category: newPoem.category,
            tags: newPoem.tags,
            username: newPoem.username || null,
            pen_name: newPoem.pen_name || null,
            email: newPoem.email || null,
            post_type: 'poem'
          }
        ])
        .select();

      if (error) {
        console.error("Supabase insert error in handleAddPoem:", error);
        return null;
      } else {
        console.log("Poem published on Supabase!", data);
        
        // Optimistically / instantly update the UI state
        const insertedItem = data?.[0];
        const mappedNewPoem: Poem = {
          id: insertedItem?.id?.toString() || `supabase-new-${Date.now()}`,
          title: insertedItem?.title || newPoem.title,
          content: insertedItem?.content || newPoem.content,
          author: insertedItem?.author_name || newPoem.author,
          category: insertedItem?.category || newPoem.category || "Soul",
          tags: Array.isArray(insertedItem?.tags) ? insertedItem.tags : (insertedItem?.tags ? [insertedItem.tags] : (newPoem.tags || ["soul"])),
          imageUrl: insertedItem?.image_url || newPoem.imageUrl || undefined,
          date: insertedItem?.created_at 
            ? new Date(insertedItem.created_at).toLocaleString() 
            : new Date().toLocaleString()
        };

        setPoems(prev => [mappedNewPoem, ...prev]);

        // Re-fetch to make sure state is exactly in sync with the server database
        fetchPoetryFeed();
        
        return null;
      }
    } catch (err) {
      console.warn("Could not connect to Supabase database inside handleAddPoem:", err);
      return null;
    }
  }, [fetchPoetryFeed]);

  const handleEnterApp = () => {
    setScreen('feed');
    setActiveTab('feed');
  };

  const handleBackToSplash = () => {
    setScreen('splash');
  };

  const allPoems = poems;

  return (
    <div className="bg-[#050b1a] text-[#F1F5F9] min-h-screen relative font-sans leading-relaxed selection:bg-indigo-500/30 selection:text-white antialiased">
      <AnimatePresence mode="wait">
        {screen === 'splash' ? (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Splash onEnter={handleEnterApp} />
          </motion.div>
        ) : (
          <motion.div
            key="feed-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full pb-32"
          >
            {/* Background elements to ensure visual coherence */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Main view container based on TabState */}
            <div className="w-full">
              {activeTab === 'feed' && (
                <Feed 
                  poems={allPoems} 
                  loading={loading} 
                  error={error} 
                  onRetry={fetchPoetryFeed} 
                  onBackToSplash={handleBackToSplash}
                  selectedCategory={sharedCategoryFilter}
                  setSelectedCategory={setSharedCategoryFilter}
                />
              )}

              {activeTab === 'create' && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 transition-all">
                  {/* Slim Shared Header */}
                  <header className="flex justify-between items-center py-6 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleBackToSplash}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 transition-all text-slate-300 hover:text-white group cursor-pointer shadow-lg backdrop-blur-sm"
                        title="Return to Splash Screen"
                      >
                        <span className="text-xs font-mono group-hover:-translate-x-1 inline-block transition-transform">← BACK</span>
                      </button>
                      <div>
                        <h2 className="text-2xl font-serif font-light tracking-wide text-white">
                          Fragments <span className="italic font-normal text-indigo-300 font-serif">of</span> Soul
                        </h2>
                      </div>
                    </div>
                  </header>

                  <CreatePoem onAddPoem={handleAddPoem} onNavigateToTab={setActiveTab} />
                </div>
              )}

              {activeTab === 'community' && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 transition-all">
                  {/* Slim Shared Header */}
                  <header className="flex justify-between items-center py-6 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleBackToSplash}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 transition-all text-slate-300 hover:text-white group cursor-pointer shadow-lg backdrop-blur-sm"
                        title="Return to Splash Screen"
                      >
                        <span className="text-xs font-mono group-hover:-translate-x-1 inline-block transition-transform">← BACK</span>
                      </button>
                      <div>
                        <h2 className="text-2xl font-serif font-light tracking-wide text-white">
                          Fragments <span className="italic font-normal text-indigo-300 font-serif">of</span> Soul
                        </h2>
                      </div>
                    </div>
                  </header>

                  <Community onNavigateToTab={setActiveTab} onFilterByCategory={setSharedCategoryFilter} />
                </div>
              )}

              {/* Admin Portal Removed */}
            </div>

            {/* Bottom Persistent Navigation Bar (Matches Images 1, 2, 3, 4) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070e20]/90 border-t border-white/10 backdrop-blur-xl flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
              {/* Navigation Tabs row */}
              <div className="max-w-lg mx-auto w-full h-16 flex justify-around items-center px-4">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={`flex flex-col items-center justify-center w-16 sm:w-20 py-1.5 transition-all cursor-pointer ${
                    activeTab === 'feed' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider font-semibold mt-1">Feed</span>
                  {activeTab === 'feed' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
                </button>

                <button 
                  onClick={() => setActiveTab('create')}
                  className={`flex flex-col items-center justify-center w-16 sm:w-20 py-1.5 transition-all cursor-pointer ${
                    activeTab === 'create' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenTool className="w-5 h-5 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider font-semibold mt-1">Create</span>
                  {activeTab === 'create' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
                </button>

                <button 
                  onClick={() => setActiveTab('community')}
                  className={`flex flex-col items-center justify-center w-16 sm:w-20 py-1.5 transition-all cursor-pointer ${
                    activeTab === 'community' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-5 h-5 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider font-semibold mt-1">Community</span>
                  {activeTab === 'community' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
                </button>

                {/* Admin button removed as requested */}
              </div>

              {/* LIFE IS SHORT, LIVE IT WORST, DIE FAST - By Rohit */}
              <div className="bg-[#050b1a] py-3.5 border-t border-white/5 text-center">
                <p className="text-[10px] sm:text-xs font-mono tracking-wider text-slate-400 uppercase select-none">
                  LIFE IS SHORT, LIVE IT WORST, DIE FAST - <span className="text-blue-500 font-bold">By Rohit</span>
                </p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
