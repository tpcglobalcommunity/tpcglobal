import { Component, ErrorInfo, ReactNode } from 'react';
import { PremiumCard, PremiumButton, NoticeBox } from '../ui';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external service if needed
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/en/home';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <PremiumCard className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Something went wrong
              </h1>
              
              <p className="text-white/70 mb-8 leading-relaxed">
                We encountered an unexpected error. Please try refreshing the page or return to the home page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <NoticeBox variant="warning" className="mb-6">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white/90 mb-2">
                      Development Error Details:
                    </div>
                    <div className="text-xs text-white/70 font-mono break-all">
                      {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div className="text-xs text-white/60 font-mono mt-2 break-all">
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                </NoticeBox>
              )}

              <div className="space-y-3">
                <PremiumButton
                  onClick={this.handleReload}
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Reload Page
                  </span>
                </PremiumButton>
                
                <PremiumButton
                  variant="secondary"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </span>
                </PremiumButton>
              </div>

              <div className="mt-6 text-xs text-white/45">
                If this problem persists, please contact support or join our community.
              </div>
            </PremiumCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
