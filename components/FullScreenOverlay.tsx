// components\FullScreenOverlay.tsx

export default function FullScreenOverlay() {
  return (
    <div
      className="full-screen-overlay absolute inset-0 z-[-1] block bg-slate-900/20 backdrop-blur-[2px] dark:bg-slate-950/30"
      aria-hidden="true"
    ></div>
  );
}
