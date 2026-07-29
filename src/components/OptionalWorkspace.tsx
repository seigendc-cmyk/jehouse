import React, { ComponentType, ReactNode, Suspense, useMemo, useState } from 'react';

interface WorkspaceErrorBoundaryProps {
  children: ReactNode;
  label: string;
  onRetry: () => void;
  onReturn: () => void;
}

interface WorkspaceErrorBoundaryState {
  error?: Error;
}

class WorkspaceErrorBoundary extends React.Component<
  WorkspaceErrorBoundaryProps,
  WorkspaceErrorBoundaryState
> {
  declare readonly props: Readonly<WorkspaceErrorBoundaryProps>;
  state: WorkspaceErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): WorkspaceErrorBoundaryState {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        className="m-6 rounded-2xl border border-orange-300 bg-orange-50 p-6 text-stone-900 shadow-lg"
      >
        <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
          Optional workspace unavailable
        </div>
        <h2 className="mt-2 text-xl font-black">{this.props.label} could not load</h2>
        <p className="mt-2 max-w-xl text-sm text-stone-600">
          Your active project and unsaved manuscript remain open. Retry this workspace or return
          to the manuscript.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={this.props.onRetry}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={this.props.onReturn}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Return to Manuscript
          </button>
        </div>
      </div>
    );
  }
}

export function WorkspaceLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="m-6 flex min-h-36 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 p-6 text-stone-800"
    >
      <div className="text-center">
        <div className="mx-auto h-8 w-8 rounded-full border-4 border-orange-200 border-t-orange-600 motion-safe:animate-spin" />
        <div className="mt-3 text-sm font-black">{label}…</div>
        <div className="mt-1 text-xs text-stone-500">Your manuscript remains available.</div>
      </div>
    </div>
  );
}

interface OptionalWorkspaceProps<Props extends object> {
  label: string;
  loader: () => Promise<{ default: ComponentType<Props> }>;
  props: Props;
  onReturn: () => void;
}

export function OptionalWorkspace<Props extends object>({
  label,
  loader,
  props,
  onReturn
}: OptionalWorkspaceProps<Props>) {
  const [attempt, setAttempt] = useState(0);
  const LazyWorkspace = useMemo(() => React.lazy(loader), [loader, attempt]);

  return (
    <WorkspaceErrorBoundary
      key={attempt}
      label={label}
      onRetry={() => setAttempt((value) => value + 1)}
      onReturn={onReturn}
    >
      <Suspense fallback={<WorkspaceLoading label={label} />}>
        <LazyWorkspace {...props} />
      </Suspense>
    </WorkspaceErrorBoundary>
  );
}
