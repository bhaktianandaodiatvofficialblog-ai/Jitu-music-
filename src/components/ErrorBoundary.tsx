import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Odia Music Portal:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleResetStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-2 text-amber-300">
            ଓଡ଼ିଆ ମ୍ୟୁଜିକ୍ ପୋର୍ଟାଲ୍ (Odia Music)
          </h1>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            ଆପ୍ ଖୋଲିବାରେ ଏକ ଛୋଟ ଅସୁବିଧା ହୋଇଛି। ଦୟାକରି ତଳେ ଥିବା ବଟନ୍ ରେ କ୍ଲିକ୍ କରି ଆପ୍ କୁ Refresh କରନ୍ତୁ।
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-orange-400 flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ଆପ୍ ରିଫ୍ରେଶ୍ କରନ୍ତୁ (Refresh)</span>
            </button>

            <button
              onClick={this.handleResetStorage}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold"
            >
               Reset Storage & Load Defaults
            </button>
          </div>

          {this.state.error && (
            <div className="mt-8 p-3 bg-slate-900 border border-slate-800 rounded-lg text-left max-w-lg w-full text-[11px] text-slate-500 font-mono overflow-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
