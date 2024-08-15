// components/point-of-sale/PointOfSale.tsx

import { usePointOfSale } from "@/contexts/PointOfSaleContext";

export default function PointOfSale() {
  const { isPointOfSaleOpen, togglePointOfSale } = usePointOfSale();

  if (!isPointOfSaleOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* PointOfSale content */}
      <button onClick={togglePointOfSale}>Close PointOfSale</button>
    </div>
  );
}
