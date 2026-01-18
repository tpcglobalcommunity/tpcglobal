import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { accordionVariants } from '../../lib/animations';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem = ({ title, children, defaultOpen = false }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.995 }}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={accordionVariants}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-2 text-white/75 text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export const Accordion = ({ children, className = '' }: AccordionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};
