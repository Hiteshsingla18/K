import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full p-6 text-slate-800">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl w-full text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-red-700">UI Rendering Error Detected</h2>
            <p className="text-sm text-red-600">The component failed to render. A defensive boundary caught this crash.</p>
            
            {this.state.error && (
              <div className="bg-white/80 p-3 rounded text-left overflow-auto text-xs font-mono border border-red-100 mt-4 max-h-40">
                <p className="font-bold text-red-800 mb-1">{this.state.error.toString()}</p>
                <p className="text-slate-600">{this.state.errorInfo?.componentStack}</p>
              </div>
            )}
            
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mx-auto transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
