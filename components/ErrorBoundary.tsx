'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 * Prevents entire app from crashing
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // TODO: Send to error tracking service (Sentry, LogRocket, etc)
        // sentryLog(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h1>

                            {/* Description */}
                            <p className="text-gray-600 mb-6">
                                We're sorry for the inconvenience. An unexpected error occurred.
                            </p>

                            {/* Error details (only in development) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="w-full mb-6 p-4 bg-gray-100 rounded-lg text-left">
                                    <p className="text-sm font-mono text-red-600 break-all">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="text-sm text-gray-700 cursor-pointer">
                                                Stack trace
                                            </summary>
                                            <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Home size={20} />
                                    Go Home
                                </button>
                            </div>

                            {/* Support link */}
                            <p className="text-sm text-gray-500 mt-6">
                                If the problem persists, please{' '}
                                <a href="/contact" className="text-blue-600 hover:underline">
                                    contact support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for convenience
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
