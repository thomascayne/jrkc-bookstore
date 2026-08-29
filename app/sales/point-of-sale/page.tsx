// app/sales/point-of-sale/page.tsx

import PointOfSaleRegister from '@/components/point-of-sale/PointOfSaleRegister';

export default function PointOfSalePage() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--app-navbar-height)] z-40">
      <PointOfSaleRegister />
    </div>
  );
}
