import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
};

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  collapsible?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  children,
  className,
  defaultValue = [],
  collapsible = false,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultValue));

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        if (!collapsible) return prev;
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('w-full space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border border-border rounded-lg overflow-hidden', className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value } as any);
        }
        return child;
      })}
    </div>
  )
);
AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const { openItems, toggleItem } = useAccordion();
    const isOpen = value ? openItems.has(value) : false;

    return (
      <button
        ref={ref}
        className={cn(
          'flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-surface/50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        onClick={() => value && toggleItem(value)}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { openItems } = useAccordion();
    const isOpen = value ? openItems.has(value) : false;

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden text-sm', className)}
        {...props}
      >
        <div className="pb-4 px-4">{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
