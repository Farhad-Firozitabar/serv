"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";

interface ProfileFormState {
  name: string;
  cafeImageUrl: string;
  instagramUrl: string;
}

/**
 * Interactive form letting users edit their cafe name and image URL.
 */
export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormState>({ name: "", cafeImageUrl: "", instagramUrl: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/profile");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "دریافت اطلاعات انجام نشد.");
        }
        if (isMounted && data.profile) {
          setFormData({
            name: data.profile.name || "",
            cafeImageUrl: data.profile.cafeImageUrl || "",
            instagramUrl: data.profile.instagramUrl || ""
          });
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "خطایی رخ داد.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPreviewError(false);
  }, [formData.cafeImageUrl]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("نام نمی‌تواند خالی باشد.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            cafeImageUrl: formData.cafeImageUrl.trim() || null,
            instagramUrl: formData.instagramUrl.trim() || null
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "به‌روزرسانی انجام نشد.");
        }

        setSuccess(data.message || "پروفایل ذخیره شد.");
        setError("");
      } catch (error) {
        setSuccess("");
        setError(error instanceof Error ? error.message : "خطایی رخ داد.");
      }
    });
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-sm shadow-emerald-50">
      <h2 className="text-lg font-bold text-slate-900">پروفایل کافه</h2>
      <p className="mt-1 text-sm text-slate-500">نام، تصویر و لینک شبکه‌های اجتماعی را برای نمایش روی منوی آنلاین تنظیم کنید.</p>

      {error && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-3 text-xs text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-2xl border border-green-100 bg-green-50/80 p-3 text-xs text-emerald-700">{success}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-2 text-right">
          <label htmlFor="cafe-name" className="text-sm font-medium text-slate-600">
            نام کافه
          </label>
          <input
            id="cafe-name"
            type="text"
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-brand focus:outline-none"
            placeholder="مثلاً کافه سرو"
            value={formData.name}
            onChange={(event) => setFormData((state) => ({ ...state, name: event.target.value }))}
            disabled={loading || pending}
          />
        </div>

        <div className="grid gap-2 text-right">
          <label htmlFor="cafe-image" className="text-sm font-medium text-slate-600">
            لینک تصویر کافه
          </label>
          <input
            id="cafe-image"
            type="url"
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-brand focus:outline-none"
            placeholder="https://example.com/logo.png"
            value={formData.cafeImageUrl}
            onChange={(event) => setFormData((state) => ({ ...state, cafeImageUrl: event.target.value }))}
            disabled={loading || pending}
          />
          <p className="text-xs text-slate-500">لینک مستقیم تصویر PNG یا JPG را وارد کنید.</p>
        </div>

        {formData.cafeImageUrl && !previewError && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
            <p className="text-xs text-slate-500">پیش‌نمایش تصویر</p>
            <img
              src={formData.cafeImageUrl}
              alt="Cafe logo preview"
              className="mx-auto mt-2 h-24 w-24 rounded-full object-cover"
              onError={() => setPreviewError(true)}
            />
          </div>
        )}

        {previewError && (
          <p className="rounded-2xl border border-yellow-200 bg-yellow-50/90 p-3 text-xs text-yellow-800">
            امکان بارگذاری تصویر وجود ندارد. لطفاً لینک دیگری وارد کنید.
          </p>
        )}

        <div className="grid gap-2 text-right">
          <label htmlFor="instagram-link" className="text-sm font-medium text-slate-600">
            لینک اینستاگرام کافه
          </label>
          <input
            id="instagram-link"
            type="url"
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-brand focus:outline-none"
            placeholder="https://instagram.com/yourcafe"
            value={formData.instagramUrl}
            onChange={(event) => setFormData((state) => ({ ...state, instagramUrl: event.target.value }))}
            disabled={loading || pending}
          />
          <p className="text-xs text-slate-500">لینکی که با instagram.com شروع می‌شود را وارد کنید تا روی منو نمایش داده شود.</p>
        </div>

        <Button type="submit" disabled={loading || pending} className="w-full">
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </form>
    </div>
  );
}
