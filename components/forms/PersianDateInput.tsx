"use client";

import { useState, useEffect } from "react";
import jalaali from "jalaali-js";

interface PersianDateInputProps {
  value?: string; // Format: YYYY/MM/DD
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * Persian date input component for selecting dates in Shamsi calendar.
 * Format: YYYY/MM/DD
 */
export default function PersianDateInput({
  value,
  onChange,
  label,
  required = false,
  placeholder = "1403/01/01"
}: PersianDateInputProps) {
  const [year, setYear] = useState(value?.split("/")[0] || "");
  const [month, setMonth] = useState(value?.split("/")[1] || "");
  const [day, setDay] = useState(value?.split("/")[2] || "");

  // Sync state with value prop
  useEffect(() => {
    if (value) {
      const parts = value.split("/");
      setYear(parts[0] || "");
      setMonth(parts[1] || "");
      setDay(parts[2] || "");
    } else {
      setYear("");
      setMonth("");
      setDay("");
    }
  }, [value]);

  const handleChange = (y: string, m: string, d: string) => {
    setYear(y);
    setMonth(m);
    setDay(d);
    
    if (y && m && d) {
      // Validate date
      const jy = parseInt(y, 10);
      const jm = parseInt(m, 10);
      const jd = parseInt(d, 10);
      
      if (jalaali.isValidJalaaliDate(jy, jm, jd)) {
        onChange(`${y}/${m.padStart(2, "0")}/${d.padStart(2, "0")}`);
      } else {
        onChange("");
      }
    } else {
      onChange("");
    }
  };

  // Get current Persian date as default
  const getCurrentPersianDate = () => {
    const now = new Date();
    const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return {
      year: jDate.jy.toString(),
      month: jDate.jm.toString().padStart(2, "0"),
      day: jDate.jd.toString().padStart(2, "0")
    };
  };

  return (
    <div className="grid gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={year}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 4) {
              handleChange(val, month, day);
            }
          }}
          placeholder="سال"
          className="w-24 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 text-center"
          maxLength={4}
        />
        <span className="flex items-center text-slate-400">/</span>
        <input
          type="text"
          value={month}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 2 && parseInt(val, 10) <= 12) {
              handleChange(year, val, day);
            }
          }}
          placeholder="ماه"
          className="w-20 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 text-center"
          maxLength={2}
        />
        <span className="flex items-center text-slate-400">/</span>
        <input
          type="text"
          value={day}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 2 && parseInt(val, 10) <= 31) {
              handleChange(year, month, val);
            }
          }}
          placeholder="روز"
          className="w-20 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 text-center"
          maxLength={2}
        />
      </div>
      <p className="text-xs text-slate-500">فرمت: {placeholder}</p>
    </div>
  );
}

