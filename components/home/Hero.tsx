'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-void" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(61,107,255,0.15)_0%,_transparent_50%)]" />
      
      {/* Floating film reel decoration */}
      <div className="absolute right-10 top-1/4 opacity-20 hidden lg:block">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          className="animate-float"
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#F0C040"
            strokeWidth="2"
            strokeDasharray="10 5"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            stroke="#F0C040"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
          <circle
            cx="100"
            cy="100"
            r="20"
            stroke="#F0C040"
            strokeWidth="2"
          />
          {/* Reel holes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={i}
              cx={100 + 45 * Math.cos((angle * Math.PI) / 180)}
              cy={100 + 45 * Math.sin((angle * Math.PI) / 180)}
              r="8"
              stroke="#F0C040"
              strokeWidth="2"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-stardust text-sm md:text-base tracking-widest uppercase mb-4"
        >
          Hollywood&apos;s Pulse, Daily
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-display text-gold text-[clamp(5rem,12vw,10rem)] leading-none mb-4"
        >
          Blockbuster Bureau
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-stardust text-xl md:text-2xl font-light mb-8"
        >
          The Bureau Never Closes
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button href="/blog">Explore News</Button>
          <Button
            variant="ghost"
            href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || '#'}
            target="_blank"
          >
            Watch on YouTube
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-gold rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}