"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts";
import type { MonthlySalesPoint } from "@/types/reports";

const chartNumberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat("fa-IR", { notation: "compact", maximumFractionDigits: 1 });

/**
 * Client-side Recharts area chart visualising سرو monthly sales totals and their volume.
 */
export default function SalesAreaChart({ data = [] }: { data?: MonthlySalesPoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    name: point.label,
    total: Number(point.total.toFixed(2))
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RechartsAreaChart
        data={chartData}
        margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#ecfdf5" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#0f172a"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="#0f172a"
          orientation="right"
          tickFormatter={(value) => compactFormatter.format(value as number)}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#047857"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTotal)"
          activeDot={{ r: 5, strokeWidth: 0, fill: "#065f46" }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as MonthlySalesPoint & { name: string };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-lg shadow-emerald-100">
      <p className="font-semibold text-slate-900">{point.name}</p>
      <p className="mt-1">
        مجموع فروش:{" "}
        <span className="font-medium text-slate-900">{formatCurrency(point.total)}</span>
      </p>
      <p>
        تعداد فاکتور: <span className="font-medium text-slate-900">{formatCount(point.orders)}</span>
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${chartNumberFormatter.format(Math.round(value))} تومان`;
}

function formatCount(value: number) {
  return chartNumberFormatter.format(value);
}
