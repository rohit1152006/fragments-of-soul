import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  User, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  Send, 
  LogOut, 
  Lock, 
  Check, 
  Loader2, 
  RefreshCw,
  Video,
  Copy
} from 'lucide-react';
import { Poem, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface CreatePoemProps {
  onAddPoem: (poem: Poem) => Promise<string | null>;
  onNavigateToTab: (tab: 'feed' | 'create' | 'community') => void;
}

const PRESET_COVERS = [
  { id: 'pres-1', name: 'Candlelight', url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=600&q=80' },
  { id: 'pres-2', name: 'Rainy Cafe', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80' },
  { id: 'pres-3', name: 'Nebula Night', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80' },
  { id: 'pres-4', name: 'Ancient Scroll', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80' },
];

export default function CreatePoem({ onAddPoem, onNavigateToTab }: CreatePoemProps) {
  // Authentication State
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('soul_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login form states
  const [username, setUsername] = useState('');
  const [penName, setPenName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Poem composition states
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(profile?.penName || '');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Healing');
  const [customTags, setCustomTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success'>('idle');
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Camera / Capture simulation state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync authorName when profile changes
  useEffect(() => {
    if (profile) {
      setAuthorName(profile.penName);
    }
  }, [profile]);

  // Handle Artist Portal/Registration submission
  const handleArtistPortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !penName.trim()) {
      setLoginError("Please enter both a username and a poetic Pen Name.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Determine elegant title and content to insert based on bio block
      const bioText = bio.trim() || "Spreading light through fragments of the soul.";
      let parsedTitle = "A Poetic Awakening";
      let parsedContent = bioText;

      if (bio.trim()) {
        const lines = bio.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          parsedTitle = lines[0];
          parsedContent = lines.slice(1).join('\n');
        } else if (lines.length === 1) {
          parsedContent = lines[0];
        }
      }

      const authorNameVal = penName.trim();

      // Write directly to Supabase poems table
      const { error } = await supabase
        .from('poems')
        .insert([
          {
            title: parsedTitle,
            content: parsedContent,
            author_name: authorNameVal,
            username: username.trim(),
            pen_name: authorNameVal,
            email: email.trim(),
            category: "Bio",
            tags: ["bio", "artist-portal"],
            post_type: 'artist_registration'
          }
        ]);

      if (error) {
        console.error("Supabase insert error on Activate Artist Portal:", error);
        setLoginError(`Supabase connection failed: ${error.message || 'Check database table columns or permissions'}`);
        setIsLoggingIn(false);
        return;
      }

      const newProfile: UserProfile = {
        username: username.trim(),
        penName: penName.trim(),
        email: email.trim(),
        bio: bioText
      };
      
      try {
        localStorage.setItem('soul_profile', JSON.stringify(newProfile));
      } catch (e) {
        console.warn("Could not save profile", e);
      }

      setProfile(newProfile);
    } catch (err: any) {
      console.error("Failed to connect to Supabase database:", err);
      setLoginError(`Database connection failed: ${err.message || err}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out
  const handleLogout = () => {
    try {
      localStorage.removeItem('soul_profile');
    } catch (e) {
      console.warn("Could not remove profile", e);
    }
    setProfile(null);
    setUsername('');
    setPenName('');
  };

  // Camera access setup
  const startCamera = async () => {
    setCameraError('');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 300 } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setCameraError("Camera unavailable or permission denied. Loading simulation studio...");
      // Simulated delay for camera loading fallback
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Capture still from video stream
  const capturePhoto = () => {
    if (cameraStream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageUrl(dataUrl);
        stopCamera();
      }
    } else {
      // Simulate snapshot since camera isn't fully connected
      const fallbackPreset = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)].url;
      setImageUrl(fallbackPreset);
      setCameraActive(false);
    }
  };

  // Trigger preset gallery selector
  const selectPreset = (url: string) => {
    setImageUrl(url);
    setShowCoverSelector(false);
  };

  // Handle Poem submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please give your poem a beautiful title!");
      return;
    }
    if (!content.trim()) {
      alert("Please write your poem before publishing!");
      return;
    }

    setPublishStatus('publishing');
    setCopiedLink(false);
    setClaimToken(null);

    try {
      // Generate tags array
      const tags = customTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);
      
      if (tags.length === 0) {
        tags.push(category.toLowerCase(), "writer");
      }

      // Format Date
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const formattedDate = new Date().toLocaleDateString('en-US', options);

      const userPoem: Poem = {
        id: `user-generated-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        author: authorName.trim() || profile?.penName || "Mysterious Soul",
        category,
        tags,
        imageUrl: imageUrl || undefined,
        date: formattedDate,
        isUserGenerated: true,
        username: profile?.username || "",
        pen_name: authorName.trim() || profile?.penName || "Mysterious Soul",
        email: profile?.email || ""
      };

      const token = await onAddPoem(userPoem);
      if (token) {
        setClaimToken(token);
      }
      setPublishStatus('success');

      // Clear input fields
      setTitle('');
      setContent('');
      setCustomTags('');
      setImageUrl('');
    } catch (err) {
      console.error("Failed to publish poem:", err);
      setPublishStatus('idle');
      alert("An error occurred while publishing. Please try again.");
    }
  };

  const handleCopyLink = () => {
    if (!claimToken) return;
    const link = `${window.location.origin}/claim?token=${claimToken}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy claim link:", err);
      });
  };

  const handleDismissSuccess = () => {
    setPublishStatus('idle');
    setClaimToken(null);
    onNavigateToTab('feed');
  };

  return (
    <div className="z-10 relative">
      <AnimatePresence mode="wait">
        
        {/* State A: Login / Account Configuration */}
        {!profile ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center space-y-3 mb-8">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner shadow-white/5">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-white tracking-wide">Poet Registration</h2>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Establish your digital artist alias to begin streaming your verses live
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleArtistPortalSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-username" className="text-xs uppercase font-mono tracking-widest text-slate-400">
                    Your Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="login-username"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                      placeholder="e.g. rohith11"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-penname" className="text-xs uppercase font-mono tracking-widest text-slate-400">
                    Poet Pen Name (Alias)
                  </label>
                  <div className="relative">
                    <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="login-penname"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                      placeholder="e.g. Rohit Chandan"
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-xs uppercase font-mono tracking-widest text-slate-400">
                    Email Address (Optional)
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                    placeholder="e.g. poet@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-bio" className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    Write ur poem with title and tell us what inspires you to your poem here (Optional)
                  </label>
                  <textarea
                    id="login-bio"
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500 h-24 resize-none"
                    placeholder="Write your poem with its title and the spark of inspiration here..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  id="activate-portal-button"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Portal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Activate Artist Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="write-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Header inside Form card */}
              <div className="flex justify-between items-start border-b border-white/10 pb-5 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">Share Your Poem</h2>
                  <p className="text-xs text-indigo-400 tracking-wide font-sans mt-1">Let your words inspire</p>
                </div>
                
                {/* Active poet display badge */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-300 max-w-[120px] truncate">{profile.penName}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all ml-1"
                    title="Change Account Poet"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Success / Publish Overlay */}
              <AnimatePresence>
                {publishStatus !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#050b1a]/95 z-30 flex flex-col justify-center items-center text-center p-6 backdrop-blur-md"
                  >
                    {publishStatus === 'publishing' ? (
                      <div className="space-y-4">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                        </div>
                        <p className="font-serif italic text-lg text-indigo-300">Publishing into live stream...</p>
                        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Securing crypt-fragment</p>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ scale: 0.9, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="space-y-6 max-w-lg w-full px-4"
                      >
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-500/10">
                          <Check className="w-8 h-8" />
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-serif text-2xl text-white">Your Fragment is Shared</p>
                          <p className="text-xs text-slate-400">
                            "Your talent can be the reason for someone's smile."
                          </p>
                        </div>

                        {claimToken && (
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3.5 backdrop-blur-md">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block">
                              🔒 Secure Your Poem
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              Your poem is live! To claim this poem (to edit or delete it later), save this secret link:
                            </p>
                            
                            <div className="flex gap-2 bg-[#050b1a] border border-white/5 rounded-xl p-2 items-center">
                              <input 
                                type="text"
                                readOnly
                                value={`${window.location.origin}/claim?token=${claimToken}`}
                                className="bg-transparent border-none outline-none text-xs font-mono text-slate-400 select-all w-full px-2"
                              />
                              <button
                                type="button"
                                onClick={handleCopyLink}
                                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${copiedLink 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                                  : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 hover:text-white'}`}
                              >
                                {copiedLink ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 block">
                              ⚠️ Warning: Since we do not use password logins, anyone with this link can manage your poem. Keep it secret!
                            </span>
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleDismissSuccess}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer animate-pulse"
                          >
                            Continue to Feed
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Creation Form */}
              <form onSubmit={handlePublish} className="space-y-6">
                
                {/* YOUR NAME field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                    placeholder="Enter your name..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>

                {/* POEM TITLE field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    POEM TITLE
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                    placeholder="Give your poem a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* TYPE / THEME SELECTOR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                      CATEGORY / MOOD
                    </label>
                    <select
                      className="w-full px-4 py-3.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-indigo-500/20 outline-none rounded-2xl text-sm text-slate-300 pointer-events-auto"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option className="bg-[#0c1222] text-slate-300" value="Healing">Healing</option>
                      <option className="bg-[#0c1222] text-slate-300" value="Inspire">Inspire</option>
                      <option className="bg-[#0c1222] text-slate-300" value="Connect">Connect</option>
                      <option className="bg-[#0c1222] text-slate-300" value="Soul">Soul</option>
                      <option className="bg-[#0c1222] text-slate-300" value="Melancholy">Melancholy</option>
                      <option className="bg-[#0c1222] text-slate-300" value="Thought">Thought</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                      TAGS (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500"
                      placeholder="e.g. fire, release, freedom"
                      value={customTags}
                      onChange={(e) => setCustomTags(e.target.value)}
                    />
                  </div>
                </div>

                {/* YOUR POEM field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    YOUR POEM
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-4 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 outline-none rounded-2xl text-sm transition-all text-white placeholder-slate-500 h-44 resize-y leading-relaxed font-serif italic"
                    placeholder="Write your poem here...&#10;&#10;Let the words flow freely."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                {/* ADD A COVER PHOTO (OPTIONAL) (Matches Image 4) */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    ADD A COVER PHOTO (OPTIONAL)
                  </span>
                  
                  {/* Buttons Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (cameraActive) stopCamera();
                        else startCamera();
                      }}
                      className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl border text-sm font-semibold tracking-wide transition-all ${
                        cameraActive 
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 animate-pulse' 
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                      } cursor-pointer`}
                    >
                      <Camera className="w-5 h-5 text-indigo-400" />
                      <span>Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setShowCoverSelector(!showCoverSelector);
                      }}
                      className="flex items-center justify-center gap-2.5 py-4 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold tracking-wide text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5 text-indigo-400" />
                      <span>Gallery</span>
                    </button>
                  </div>

                  {/* Camera capture screen */}
                  {cameraActive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-4 space-y-3"
                    >
                      {cameraError ? (
                        <div className="text-center p-6 text-xs text-slate-400 space-y-2">
                          <p>{cameraError}</p>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-indigo-600 rounded-xl text-white font-semibold flex items-center gap-1.5 mx-auto hover:bg-indigo-500"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Capture Simulation Picture</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <video ref={videoRef} autoPlay playsInline className="w-full max-h-[220px] rounded-xl object-cover bg-black" />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Capture Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Preset Gallery Selector */}
                  {showCoverSelector && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 shadow-inner"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Curated Ambient Covers</span>
                        {imageUrl && (
                          <button 
                            type="button" 
                            onClick={() => setImageUrl('')} 
                            className="text-[10px] text-rose-400 hover:underline"
                          >
                            Remove Current
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PRESET_COVERS.map(cover => (
                          <button
                            key={cover.id}
                            type="button"
                            onClick={() => selectPreset(cover.url)}
                            className={`relative h-20 rounded-xl overflow-hidden border transition-all hover:scale-[1.03] group ${
                              imageUrl === cover.url ? 'border-indigo-400 shadow-md scale-[1.02]' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <img src={cover.url} alt={cover.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[10px] text-white font-medium font-sans tracking-wide">{cover.name}</span>
                            </div>
                            {imageUrl === cover.url && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-90">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Explicit custom link upload option */}
                      <div className="pt-2">
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 outline-none rounded-xl text-xs text-white placeholder-slate-500"
                          placeholder="Or paste external image URL..."
                          value={imageUrl.startsWith('data:') ? '' : imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Cover Photo selected container preview */}
                  {imageUrl && (
                    <div className="relative h-28 rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-950/40 flex items-center justify-center">
                      <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-transparent flex flex-col justify-center items-center">
                        <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase font-semibold">Active Background Selected</span>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="mt-1 text-xs text-white hover:text-red-400 transition-colors underline font-sans"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="publish-poem-button"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-8"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Soul Portal</span>
                </button>
              </form>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
