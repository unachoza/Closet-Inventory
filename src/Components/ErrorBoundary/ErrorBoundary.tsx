import { Component, ErrorInfo, ReactNode } from "react";
import { logDebug, logError } from "../../utils/logger";
import { captureException } from "../../lib/monitoring";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
	children: ReactNode;
	/** Optional custom fallback. When omitted a default message + retry is shown. */
	fallback?: ReactNode;
	/** Called when the boundary catches an error (e.g. to report to a logger). */
	onError?: (error: Error, info: ErrorInfo) => void;
	/**
	 * Called when the user clicks "Try again". Use this to navigate back to a
	 * known-good screen — clearing the boundary's own state isn't enough if the
	 * same child would just throw again.
	 */
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Catches render-time errors in its subtree and shows fallback UI instead of
 * letting React unmount the whole tree (which surfaces as a blank screen).
 *
 * Tip: pass a `key` that changes on navigation (e.g. the current view) so the
 * boundary resets automatically when the user moves to a different screen.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false, error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		logError("ErrorBoundary", error);
		logDebug("ErrorBoundary", info.componentStack ?? undefined);
		// Report to Sentry too — no-ops without consent/DSN (see lib/monitoring).
		void captureException(error);
		this.props.onError?.(error, info);
	}

	handleReset = () => {
		logDebug("ErrorBoundary", "reset triggered");
		// Clear our own error state, then let the app move to a safe screen.
		// Without onReset the same child would re-render and throw again.
		this.setState({ hasError: false, error: null });
		this.props.onReset?.();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return (
				<div role="alert" className="error-boundary">
					<h2 className="error-boundary__title">Something went wrong</h2>
					<p className="error-boundary__message">
						{this.state.error?.message ?? "An unexpected error occurred while rendering this view."}
					</p>
					<button className="error-boundary__retry" onClick={this.handleReset}>
						Try again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
