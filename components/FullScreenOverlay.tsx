// components\FullScreenOverlay.tsx

export default function FullScreenOverlay() {
  return (
    <div
      className="full-screen-overlay z-[-1] absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 block"
      aria-hidden="true"
    ></div>
  );
}
