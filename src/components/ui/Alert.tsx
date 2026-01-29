import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, dismissible, onDismiss, children, ...props }, ref) => {
    const icons = {
      default: Info,
      destructive: AlertCircle,
      warning: AlertCircle,
      success: CheckCircle,
    };

    const variants = {
      default: 'bg-surface border-border text-white',
      destructive: 'bg-danger/10 border-danger text-danger',
      warning: 'bg-warning/10 border-warning text-warning',
      success: 'bg-success/10 border-success text-success',
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {title && (
              <h5 className="font-medium mb-1">{title}</h5>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
