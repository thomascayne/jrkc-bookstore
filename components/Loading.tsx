// app/category/[key]/loading.tsx

interface LoadingProps {
  containerClass?: string;
  position?: string;
}

export default function Loading({ containerClass, position }: LoadingProps) {
  return (
    <div
      className={` bg-white bg-opacity-75 flex items-center justify-center z-50 ${position ? 'absolute' : 'fixed'} ${containerClass || 'inset-0'}`}
    >
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}
