import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * @interface Props
 * @property {ReactNode} children - The child components to render.
 */
interface Props {
  children: ReactNode;
}

/**
 * @interface State
 * @property {boolean} hasError - Whether an error has been caught.
 */
interface State {
  hasError: boolean;
}

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  /**
   * A lifecycle method that is invoked after an error has been thrown by a descendant component.
   * @param {Error} _ - The error that was thrown.
   * @returns {State} An object to update the state.
   */
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  /**
   * A lifecycle method that is invoked after an error has been thrown by a descendant component.
   * @param {Error} error - The error that was thrown.
   * @param {ErrorInfo} errorInfo - An object with a `componentStack` key containing information about which component threw the error.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging for debugging
    console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Error Stack:", error.stack);
    console.error("=====================================");
  }

  /**
   * Renders the component.
   * @returns {ReactNode} The rendered component.
   */
  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4" role="alert">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold text-destructive mb-2">Something went wrong</h1>
          <p className="text-lg text-muted-foreground mb-6">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()} variant="destructive">
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
