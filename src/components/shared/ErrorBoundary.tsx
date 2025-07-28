import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
          <h1 className="text-4xl font-bold text-red-600">Oops! Algo salió mal.</h1>
          <p className="text-gray-600 mt-4">
            Estamos experimentando problemas técnicos. Por favor, intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
