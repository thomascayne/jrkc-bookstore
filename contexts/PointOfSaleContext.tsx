// contexts/PointOfSaleContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

const PointOfSaleContext = createContext({
  isPointOfSaleOpen: false,
  togglePointOfSale: () => {},
});

export const PointOfSaleProvider: React.FC<{ children: ReactNode }> = ({ children}) => {
  const [isPointOfSaleOpen, setIsPointOfSaleOpen] = useState(false);

  const togglePointOfSale = () => setIsPointOfSaleOpen(!isPointOfSaleOpen);

  return (
    <PointOfSaleContext.Provider value={{ isPointOfSaleOpen, togglePointOfSale }}>
      {children}
    </PointOfSaleContext.Provider>
  );
};

export const usePointOfSale = () => useContext(PointOfSaleContext);

