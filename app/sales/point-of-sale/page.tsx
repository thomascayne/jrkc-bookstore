// app/sales/point-of-sale/page.tsx

import FullScreenOverlay from '@/components/FullScreenOverlay';
import PointOfSaleRegister from '@/components/point-of-sale/PointOfSaleRegister';

export default function PointOfSalePage() {
  return (
    <div className='fixed inset-0 z-50'>
      {/* <FullScreenOverlay /> */}
      <PointOfSaleRegister />
    </div>
  );
}
