import { Component } from 'react';
import Card from './Card';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
          <Card className="max-w-md p-6 text-center">
            <h1 className="mb-2 font-display text-2xl font-bold text-brand-900">Something went wrong</h1>
            <p className="mb-4 text-brand-600">An unexpected error occurred. Please try refreshing the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh page</Button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-brand-500">Error details</summary>
                <pre className="mt-2 overflow-auto rounded bg-brand-100 p-2 text-xs text-brand-700">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
