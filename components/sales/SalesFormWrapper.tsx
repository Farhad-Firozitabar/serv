"use client";

import { useState } from "react";
import SalesForm from "./SalesForm";
import SalesHistory from "./SalesHistory";

interface Sale {
  id: string;
  total: number;
  phone: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    qty: number;
    price: number;
    menuItem: { name: string } | null;
  }>;
}

interface SalesFormWrapperProps {
  initialSales: Sale[];
}

/**
 * Wrapper component that connects SalesForm and SalesHistory for refresh functionality.
 */
export default function SalesFormWrapper({ initialSales }: SalesFormWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaleCreated = () => {
    // Trigger refresh of sales history
    setRefreshKey((prev) => prev + 1);
  };

  return <SalesForm onSaleCreated={handleSaleCreated} />;
}

