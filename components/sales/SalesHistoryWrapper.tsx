"use client";

import { useState, useEffect } from "react";
import SalesHistory from "./SalesHistory";

interface Sale {
  id: string;
  total: number;
  phone: string | null;
  paymentMethod: string;
  createdAt: Date;
  items: Array<{
    id: string;
    qty: number;
    price: number;
    menuItem: { name: string } | null;
  }>;
}

interface SalesHistoryWrapperProps {
  initialSales: Sale[];
}

/**
 * Wrapper component for SalesHistory that listens for refresh events.
 */
export default function SalesHistoryWrapper({ initialSales }: SalesHistoryWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey((prev) => prev + 1);
    };

    // Listen for custom event
    window.addEventListener("saleCreated", handleStorageChange);

    return () => {
      window.removeEventListener("saleCreated", handleStorageChange);
    };
  }, []);

  return <SalesHistory initialSales={initialSales} refreshKey={refreshKey} />;
}

