// components/PlaceholderImage.tsx

interface PlaceholderImageProps {
  height?: number;
  width?: number;
}

export default function PlaceholderImage({
  height = 75,
  width = 50,
}: PlaceholderImageProps) {
  return (
    <div
      className="relative bg-gray-200 rounded-md overflow-hidden shadow-md object-cover"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
        <div className="text-xs font-bold text-center mb-1">Book Title</div>
        <div className="text-[8px] italic">Author</div>
      </div>
      <div
        className="absolute top-0 left-0 w-1/5 h-full bg-blue-300 transform -skew-y-6"
        style={{ transformOrigin: "top left" }}
      ></div>
    </div>
  );
}
