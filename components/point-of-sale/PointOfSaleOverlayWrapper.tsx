// components/point-of-sale/PointOfSaleOverlayWrapper.tsx

import { useState } from "react";
import PointOfSaleOverlay from "@/components/point-of-sale/PointOfSaleOverlay";

const PointOfSaleOverlayWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPOSOpen, setIsPOSOpen] = useState(false);
  
    return (
      <>
        {children}
        <PointOfSaleOverlay isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />
      </>
    );
  };
  
  export default PointOfSaleOverlayWrapper;