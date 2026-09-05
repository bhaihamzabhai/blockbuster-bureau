'use client';

import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`bg-nebula rounded-xl border border-white/5 hover:border-gold/30 shadow-glow hover:shadow-glow-lg transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}