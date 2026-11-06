import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { STORAGE_KEY } from "../lib/settings";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Last line of defence: if rendering ever throws, show a recoverable screen
 * instead of a blank page. "Reset & reload" also clears persisted settings,
 * which is the most likely source of a persistent crash.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SnapCode] Unhandled UI error", error, info.componentStack);
  }

  private reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-[#ECEEF1] p-6">
        <div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <TriangleAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            SnapCode hit an unexpected error. Your code never leaves your device. Resetting preferences and reloading
            usually fixes this.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" /> Reset &amp; reload
          </button>
        </div>
      </div>
    );
  }
}
