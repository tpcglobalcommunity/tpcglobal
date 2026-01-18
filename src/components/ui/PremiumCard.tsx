import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const PremiumCard = ({ children, className = '', hover = true, delay = 0 }: PremiumCardProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
      whileHover={hover ? { y: -4, borderColor: 'rgba(240, 185, 11, 0.3)' } : {}}
      className={`
        backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8
        shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.1)]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
