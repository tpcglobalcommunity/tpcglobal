import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export const cardHover: Variants = {
  rest: {
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const buttonTap: Variants = {
  rest: {
    scale: 1,
  },
  tap: {
    scale: 0.98,
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
  const offsets = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    up: { x: 0, y: -100 },
    down: { x: 0, y: 100 },
  };

  return {
    initial: {
      opacity: 0,
      ...offsets[direction],
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      ...offsets[direction],
      transition: {
        duration: 0.3,
      },
    },
  };
};

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
      opacity: {
        duration: 0.25,
        ease: 'easeInOut',
      },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
      opacity: {
        duration: 0.25,
        ease: 'easeInOut',
        delay: 0.1,
      },
    },
  },
};
