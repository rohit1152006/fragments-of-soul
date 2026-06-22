import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Mail, 
  Globe, 
  ChevronRight, 
  Sun, 
  HeartPulse, 
  PenTool
} from 'lucide-react';

interface CommunityProps {
  onNavigateToTab: (tab: 'feed' | 'create' | 'community') => void;
  onFilterByCategory: (category: string) => void;
}

export default function Community({ onNavigateToTab, onFilterByCategory }: CommunityProps) {
  // Navigation grid trigger handlers
  const handleGridAction = (action: string) => {
    switch (action) {
      case 'Create':
        onNavigateToTab('create');
        break;
      case 'Heal':
        onFilterByCategory('Healing');
        onNavigateToTab('feed');
        break;
      case 'Inspire':
        onFilterByCategory('Inspire');
        onNavigateToTab('feed');
        break;
      case 'Connect':
        onFilterByCategory('Connect');
        onNavigateToTab('feed');
        break;
    }
  };

  return (
    <div className="z-10 relative pb-16">
      
      {/* 1. SCENIC MOUNTAIN HEADER GRID (matches images perfectly) */}
      <div className="relative rounded-3xl overflow-hidden h-64 sm:h-72 w-full mb-8 shadow-2xl border border-white/5">
        {/* Dynamic Dark nature imagery mimicking alpine sunset range */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1a] via-slate-950/40 to-slate-950/20" />
        
        {/* Texts over mountain background */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 space-y-1.5 z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-wide font-light">Our Mission</h1>
            <p className="text-xs sm:text-sm font-sans tracking-widest text-indigo-200 mt-1 uppercase font-semibold">Fragments of Soul</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* 2. DYNAMIC ORANGE-BORDER HIGHLIGHT HIGHLIGHT CARD (Matches Image 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-white/5 shadow-xl flex items-start gap-4 overflow-hidden"
        >
          {/* Aesthetic Yellow/Gold Accent Vertical Bar */}
          <div className="w-[4px] self-stretch rounded-full bg-gradient-to-b from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          
          <div className="flex-1">
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-serif italic tracking-wide">
              "Join our vibrant community and be the reason for someone's happiness. Your talent can be the reason for someone's smile."
            </p>
          </div>
        </motion.div>

        {/* 3. FOUR CARD GRID: Heal, Inspire, Connect, Create (Matches Image 1) */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Grid Card 1: Heal */}
          <button
            onClick={() => handleGridAction('Heal')}
            className="flex flex-col items-center text-center p-6 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-serif text-base text-slate-100 font-medium">Heal</span>
            <span className="text-[10px] text-slate-400 mt-1 font-sans">Words that comfort the soul</span>
          </button>

          {/* Grid Card 2: Inspire */}
          <button
            onClick={() => handleGridAction('Inspire')}
            className="flex flex-col items-center text-center p-6 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <span className="font-serif text-base text-slate-100 font-medium">Inspire</span>
            <span className="text-[10px] text-slate-400 mt-1 font-sans">Spark joy and wonder</span>
          </button>

          {/* Grid Card 3: Connect */}
          <button
            onClick={() => handleGridAction('Connect')}
            className="flex flex-col items-center text-center p-6 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-serif text-base text-slate-100 font-medium">Connect</span>
            <span className="text-[10px] text-slate-400 mt-1 font-sans">Build bridges through verse</span>
          </button>

          {/* Grid Card 4: Create */}
          <button
            onClick={() => handleGridAction('Create')}
            className="flex flex-col items-center text-center p-6 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 border border-purple-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <span className="font-serif text-base text-slate-100 font-medium">Create</span>
            <span className="text-[10px] text-slate-400 mt-1 font-sans">Express your authentic self</span>
          </button>

        </div>

        {/* 4. COMMUNITY & CONTACT LIST SECTION (Matches Image 2 & 3) */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#e8b668] font-bold mb-1 text-center">
            COMMUNITY & CONTACT
          </h2>

          <div className="space-y-4 max-w-md mx-auto">
            
            {/* Item 1: Join Our Community */}
            <a
              href="https://whatsapp.com/channel/0029Vb8KzicIiRozCO45oh0W"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4.5 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">Join Our Community</h3>
                  <span className="text-xs text-slate-400">Connect with poets worldwide</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

            {/* Item 2: Contact Us */}
            <a
              href="mailto:contact.fragmentsofsoul@gmail.com"
              className="w-full flex items-center justify-between p-4.5 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">Contact Us</h3>
                  <span className="text-xs text-slate-400">contact.fragmentsofsoul@gmail.com</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

            {/* Item 3: Visit Website */}
            <a
              href="https://rohit1152006.github.io/fragmentsofsoul/dump.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4.5 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">Visit Website</h3>
                  <span className="text-xs text-slate-400">fragmentsofsoul.github.io</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

          </div>
        </div>

        {/* 5. INTERSTITIAL CAROUSEL DOT INDICATORS */}
        <div className="flex justify-center items-center gap-2.5 py-4">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors cursor-pointer" onClick={() => onNavigateToTab('feed')} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors cursor-pointer" onClick={() => onNavigateToTab('create')} />
          <span className="w-6 h-1 rounded-full bg-indigo-500 transition-colors" />
        </div>

        {/* 6. CENTERED FOOTER INFOS (Matches Image 3) */}
        <div className="text-center pt-8 space-y-2 select-none">
          <h4 className="text-sm sm:text-base font-serif font-semibold text-slate-200 tracking-wider">Fragments of Soul</h4>
          <p className="text-xs text-slate-400 font-sans italic">Inspiring Emotional Healing Through Poetry</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase pt-4">
            v1.0 — Built with love for the written word
          </p>
          <p className="text-[9px] font-mono tracking-[0.16em] text-[#e8b668] uppercase pt-2 opacity-95">
            © 2026 Fragments of Soul. Certified Copyright Registry. All Rights Reserved.
          </p>
        </div>

      </div>

    </div>
  );
}
