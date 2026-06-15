import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-low p-6 text-center">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-xl border border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-error mb-4">
              Something went wrong.
            </h2>
            <p className="font-body-md text-body-md text-secondary mb-6">
              An unexpected error occurred in this view. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-semibold active:scale-95 transition-all shadow-md hover:bg-primary-container"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
