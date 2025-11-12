"use client";

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Sale } from "@prisma/client";

/**
 * Client-side Recharts area chart visualising CafePOS sales totals over time.
 */
export default function SalesAreaChart({ sales }: { sales: Sale[] }) {
  const data = sales.map((sale) => ({
    name: new Date(sale.createdAt).toLocaleDateString(),
    total: Number(sale.total)
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsAreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip />
        <Area type="monotone" dataKey="total" stroke="#7c3aed" fillOpacity={1} fill="url(#colorTotal)" />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
