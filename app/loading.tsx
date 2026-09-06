export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );
}
