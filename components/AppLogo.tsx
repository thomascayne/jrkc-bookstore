// components\AppLogo.tsx

import Image from "next/image";

interface AppLogoProps {
  width?: number;
  height?: number;
}
export default function AppLogo({ height = 30, width = 100 }: AppLogoProps) {
  return (
    <div className="flex items-center">
      <Image
        src="/jrkc-bookstore-logo-100x37.png"
        alt="JRKC Logo"
        width={width}
        height={height}
      />
    </div>
  );
}
