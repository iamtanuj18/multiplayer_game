import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to external error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          backgroundColor: "#f5f5f5"
        }}>
          <div style={{
            maxWidth: "600px",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{ color: "#d32f2f", marginBottom: "20px" }}>
              Oops! Something went wrong
            </h1>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Reload Page
            </button>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={{ marginTop: "30px" }}>
                <summary style={{ cursor: "pointer", color: "#1976d2" }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: "10px",
                  padding: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px"
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
