
import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Simple centralized logging mechanism
    // In real prod: send to remote log service
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center bg-red-50 p-8 rounded shadow-lg m-4">
          <AlertTriangle className="text-red-500 h-12 w-12 mb-2" />
          <h2 className="font-bold text-xl mb-2 text-red-800">An unexpected error occurred</h2>
          <pre className="mb-2 text-sm text-gray-600">{this.state.error?.message || "Sorry, something went wrong."}</pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 rounded bg-primary-600 text-white font-semibold shadow hover:bg-primary-700"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
