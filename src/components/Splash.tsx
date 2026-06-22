import { motion } from 'motion/react';

interface SplashProps {
  onEnter: () => void;
}

export default function Splash({ onEnter }: SplashProps) {
  return (
    <div className="relative min-h-screen bg-[#071321] text-white overflow-hidden flex flex-col justify-between p-6 md:p-12">
      {/* Background Image Layer with Moody Filter */}
      <div 
        className="absolute inset-0 z-0 select-none pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6) contrast(1.15) saturate(0.8) sepia(0.08) hue-rotate(-5deg)',
        }}
      />

      {/* Dark Vignette Overlay to enhance contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1625]/80 via-[#0c182a]/85 to-[#040a13]/98 pointer-events-none z-0" />

      {/* Grid Pattern overlay for depth and premium texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0 opacity-60" />

      {/* Top Margin/Spacer for layout breathing room */}
      <div className="w-full h-8 z-10" />

      {/* Central Content Portal (Matches Mockup 1 & 2 Layout perfectly) */}
      <div className="max-w-xl mx-auto flex-1 flex flex-col justify-center items-center text-center z-10 my-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          {/* Three Dots At Top (Blue, Golden, Blue) */}
          <div className="flex items-center gap-3.5 mb-8">
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 0.2 }}
              className="w-3.5 h-3.5 rounded-full bg-[#6ca9c2]"
            />
            {/* Larger Golden/Amber dot in the middle */}
            <motion.span 
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-[18px] h-[18px] rounded-full bg-[#e8b668]"
            />
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 0.4 }}
              className="w-3.5 h-3.5 rounded-full bg-[#6ca9c2]"
            />
          </div>

          {/* Main Title: two lines centered */}
          <h1 className="text-[40px] sm:text-[46px] font-sans font-bold tracking-tight text-white leading-[1.2] mb-5 select-none drop-shadow-md">
            Fragments of <br /> Soul
          </h1>
          
          {/* Subtle Golden Underbar Line */}
          <div className="w-16 h-[2px] bg-[#e8b668] rounded-full my-6 opacity-90 shadow-sm" />

          {/* Tagline: Two lines centered */}
          <div className="space-y-1.5 max-w-xs sm:max-w-sm px-4">
            <p className="text-sm sm:text-base text-[#96b6c5] uppercase tracking-[0.22em] font-medium font-sans">
              Inspiring Emotional Healing
            </p>
            <p className="text-sm sm:text-base text-[#96b6c5] uppercase tracking-[0.22em] font-light font-sans">
              Through Poetry
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Area: Custom Pill Button and Elegant Sanctuary subtext */}
      <div className="w-full flex flex-col items-center justify-end z-10 pb-8 mt-auto">
        <motion.button 
          id="enter-app-button"
          onClick={onEnter}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
          className="group px-12 py-3.5 border border-[#6ca9c2]/40 hover:border-[#6ca9c2]/60 bg-[#0e1f32]/35 hover:bg-[#0e1f32]/50 backdrop-blur-md rounded-full flex items-center justify-center gap-6 transition-all duration-300 cursor-pointer text-white shadow-xl shadow-black/20"
        >
          <span className="font-semibold tracking-[0.16em] text-sm uppercase">
            Explore
          </span>
          <svg 
            className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 text-white/90" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </motion.button>
        
        {/* Footnote text: A sanctuary for the written word */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 0.7, duration: 1.2 }}
          className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#96b6c5] font-sans mt-8 select-none"
        >
          A sanctuary for the written word
        </motion.p>

        {/* Developer Credit */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-[9px] uppercase tracking-[0.2em] text-[#e8b668] font-mono mt-3 select-none"
        >
          By Rohit Chandan M S
        </motion.p>
      </div>
    </div>
  );
}

