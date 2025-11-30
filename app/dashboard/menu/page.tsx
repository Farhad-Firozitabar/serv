"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import Button from "@/components/ui/Button";

const rial = new Intl.NumberFormat("fa-IR", {
  style: "currency",
  currency: "IRR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const numberFormatter = new Intl.NumberFormat("en-US");

// Helper function to format number with English digits and commas for input
const formatPrice = (value: string | number): string => {
  if (!value && value !== 0) return "";
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) return "";
  return numberFormatter.format(numValue);
};

// Helper function to parse formatted string back to number
const parsePrice = (value: string): string => {
  // Remove all non-digit characters
  return value.replace(/[^\d]/g, "");
};

interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  category: string | null;
  materials: string[];
  createdAt: string;
}

/**
 * Menu page allowing users to manage their menu items.
 */
export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    category: "",
    materials: [] as string[]
  });
  const [newMaterial, setNewMaterial] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [shareInfo, setShareInfo] = useState<{
    shareSlug: string;
    cafeName: string;
    cafeImageUrl: string | null;
    url: string;
  } | null>(null);
  const [shareLoading, setShareLoading] = useState(true);
  const [shareError, setShareError] = useState("");
  const [hasOnlineMenu, setHasOnlineMenu] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setShareLoading(true);
      setShareError("");
      try {
        const res = await fetch("/api/menu/share");
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403) {
            // User doesn't have online menu access
            if (isMounted) {
              setHasOnlineMenu(false);
              setShareError(data.error || "منوی آنلاین برای شما فعال نشده است.");
            }
            return;
          }
          throw new Error(data.error || "امکان تهیه لینک منوی آنلاین وجود ندارد.");
        }
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = origin ? `${origin}/menu/${data.shareSlug}` : `/menu/${data.shareSlug}`;
        if (isMounted) {
          setHasOnlineMenu(true);
          setShareInfo({
            shareSlug: data.shareSlug,
            cafeName: data.cafeName,
            cafeImageUrl: data.cafeImageUrl ?? null,
            url
          });
        }
      } catch (error) {
        if (isMounted) {
          setShareError(error instanceof Error ? error.message : "خطایی در ساخت لینک رخ داد.");
        }
      } finally {
        if (isMounted) {
          setShareLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!shareInfo?.url) {
      return;
    }

    let isMounted = true;
    setQrLoading(true);
    setQrDataUrl("");
    setQrError("");

    QRCode.toDataURL(shareInfo.url, { width: 320, margin: 1 })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((error) => {
        console.error("Failed to generate QR code:", error);
        if (isMounted) {
          setQrError("امکان ساخت QR Code وجود ندارد.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setQrLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shareInfo?.url]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await fetch("/api/menu/list");
      const data = await res.json();
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error("Failed to load menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/menu/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCopyLink = async () => {
    if (!shareInfo?.url) {
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareInfo.url);
      } else {
        throw new Error("clipboard unavailable");
      }
      setLinkCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("امکان کپی خودکار وجود ندارد. لطفاً لینک را به صورت دستی انتخاب کنید.");
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) {
      return;
    }
    const tempLink = document.createElement("a");
    tempLink.href = qrDataUrl;
    tempLink.download = `${shareInfo?.cafeName || "menu"}-qr.png`;
    tempLink.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }

    // Parse the formatted price string to get the actual number
    const priceString = parsePrice(formData.price);
    const price = parseFloat(priceString);
    if (isNaN(price) || price < 0) {
      alert("لطفاً یک قیمت معتبر وارد کنید.");
      return;
    }

    // Parse cost if provided
    let cost: number | null = null;
    if (formData.cost) {
      const costString = parsePrice(formData.cost);
      const parsedCost = parseFloat(costString);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        cost = parsedCost;
      } else if (costString !== "") {
        alert("لطفاً یک هزینه معتبر وارد کنید.");
        return;
      }
    }

    startTransition(async () => {
      try {
        if (editingId) {
          // Update existing item
          const res = await fetch(`/api/menu/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              price: price,
              cost: cost,
              category: formData.category || null,
              materials: formData.materials
            })
          });

          if (res.ok) {
            await loadMenuItems();
            await loadCategories();
            setFormData({ name: "", price: "", cost: "", category: "", materials: [] });
            setNewMaterial("");
            setIsCreatingCategory(false);
            setNewCategory("");
            setEditingId(null);
          } else {
            const error = await res.json();
            alert(error.error || "به‌روزرسانی انجام نشد.");
          }
        } else {
          // Create new item
          const res = await fetch("/api/menu/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              price: price,
              cost: cost,
              category: formData.category || null,
              materials: formData.materials
            })
          });

          if (res.ok) {
            await loadMenuItems();
            await loadCategories();
            setFormData({ name: "", price: "", cost: "", category: "", materials: [] });
            setNewMaterial("");
            setIsCreatingCategory(false);
            setNewCategory("");
          } else {
            const error = await res.json();
            alert(error.error || "ثبت آیتم انجام نشد.");
          }
        }
      } catch (error) {
        console.error("Error saving menu item:", error);
        alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      price: formatPrice(item.price),
      cost: item.cost ? formatPrice(item.cost) : "",
      category: item.category || "",
      materials: item.materials || []
    });
    setIsCreatingCategory(false);
    setNewCategory("");
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟")) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/menu/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          await loadMenuItems();
        } else {
          const error = await res.json();
          alert(error.error || "حذف انجام نشد.");
        }
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  const handleCancel = () => {
    setFormData({ name: "", price: "", cost: "", category: "", materials: [] });
    setNewMaterial("");
    setIsCreatingCategory(false);
    setNewCategory("");
    setEditingId(null);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__new__") {
      setIsCreatingCategory(true);
      setFormData({ ...formData, category: "" });
    } else {
      setIsCreatingCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const confirmNewCategory = () => {
    if (newCategory.trim()) {
      const trimmedCategory = newCategory.trim();
      if (!categories.includes(trimmedCategory)) {
        setCategories([...categories, trimmedCategory].sort());
      }
      setFormData({ ...formData, category: trimmedCategory });
      setIsCreatingCategory(false);
      setNewCategory("");
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()]
      });
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">منو</h1>
        <p className="text-sm text-slate-500">مدیریت آیتم‌های منوی کافه خود را انجام دهید.</p>
      </header>

      {hasOnlineMenu && (
        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/70 p-6 shadow-sm shadow-emerald-50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">منوی آنلاین قابل اشتراک</h2>
              <p className="text-sm text-slate-500">
                لینک زیر شامل نام کافه شماست و می‌توانید آن را با مشتریان یا روی میزها به اشتراک بگذارید.
              </p>
            </div>
            {shareInfo?.cafeImageUrl && (
              <div className="ml-auto h-16 w-16 overflow-hidden rounded-full border border-emerald-200 bg-white">
                <img src={shareInfo.cafeImageUrl} alt="Cafe logo" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {shareError ? (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-3 text-xs text-red-700">{shareError}</p>
          ) : (
            <div className="mt-5 grid gap-6 lg:grid-cols-[2fr,auto] lg:items-center">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">لینک اختصاصی</label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <input
                    type="text"
                    className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm font-mono shadow-inner"
                    dir="ltr"
                    readOnly
                    value={shareLoading ? "در حال آماده‌سازی لینک..." : shareInfo?.url || ""}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCopyLink}
                    disabled={shareLoading || !shareInfo?.url}
                    className="w-full md:w-auto"
                  >
                    {linkCopied ? "کپی شد" : "کپی لینک"}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">این آدرس همیشه به آخرین تغییرات منوی شما متصل است.</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                {qrLoading ? (
                  <div className="h-32 w-32 animate-pulse rounded-2xl border border-dashed border-slate-200 bg-white/60" />
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR code برای منوی کافه"
                    className="h-32 w-32 rounded-2xl border border-slate-200 bg-white p-2 shadow-inner"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-2xl border border-dashed border-slate-200 bg-white/60" />
                )}
                <Button type="button" variant="secondary" onClick={handleDownloadQr} disabled={!qrDataUrl} className="w-full text-xs">
                  دانلود QR Code
                </Button>
                {qrError && <p className="text-center text-xs text-red-600">{qrError}</p>}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <div className="rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm shadow-emerald-50">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            {editingId ? "ویرایش آیتم" : "افزودن آیتم جدید"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                نام آیتم *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
                placeholder="مثلاً ایس امریکانو"
                disabled={pending}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium text-slate-700">
                قیمت (ریال) *
              </label>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                required
                value={formData.price}
                onChange={(e) => {
                  const rawValue = parsePrice(e.target.value);
                  // Only update if it's a valid number or empty
                  if (rawValue === "" || !isNaN(parseFloat(rawValue))) {
                    const formatted = rawValue === "" ? "" : formatPrice(rawValue);
                    setFormData({ ...formData, price: formatted });
                  }
                }}
                onBlur={(e) => {
                  // Ensure the value is formatted on blur
                  const rawValue = parsePrice(e.target.value);
                  if (rawValue) {
                    setFormData({ ...formData, price: formatPrice(rawValue) });
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left font-mono"
                placeholder="0"
                disabled={pending}
                dir="ltr"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="cost" className="text-sm font-medium text-slate-700">
                هزینه (ریال)
              </label>
              <input
                id="cost"
                type="text"
                inputMode="numeric"
                value={formData.cost}
                onChange={(e) => {
                  const rawValue = parsePrice(e.target.value);
                  // Only update if it's a valid number or empty
                  if (rawValue === "" || !isNaN(parseFloat(rawValue))) {
                    const formatted = rawValue === "" ? "" : formatPrice(rawValue);
                    setFormData({ ...formData, cost: formatted });
                  }
                }}
                onBlur={(e) => {
                  // Ensure the value is formatted on blur
                  const rawValue = parsePrice(e.target.value);
                  if (rawValue) {
                    setFormData({ ...formData, cost: formatPrice(rawValue) });
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left font-mono"
                placeholder="0"
                disabled={pending}
                dir="ltr"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium text-slate-700">
                دسته‌بندی
              </label>
              {!isCreatingCategory ? (
                <div className="flex gap-2">
                  <select
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm"
                    disabled={pending}
                  >
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__new__">+ افزودن دسته جدید</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        confirmNewCategory();
                      }
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm"
                    placeholder="نام دسته جدید"
                    disabled={pending}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={confirmNewCategory}
                    disabled={pending || !newCategory.trim()}
                    className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    تایید
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategory("");
                      setFormData({ ...formData, category: "" });
                    }}
                    disabled={pending}
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    انصراف
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                مواد اولیه
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMaterial();
                    }
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm"
                  placeholder="مثلاً قهوه، شکر، شیر"
                  disabled={pending}
                />
                <button
                  type="button"
                  onClick={addMaterial}
                  disabled={pending || !newMaterial.trim()}
                  className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  افزودن
                </button>
              </div>
              {formData.materials.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.materials.map((material, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        disabled={pending}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="حذف"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="primary" disabled={pending} className="flex-1">
                {pending
                  ? editingId
                    ? "در حال به‌روزرسانی..."
                    : "در حال ثبت..."
                  : editingId
                  ? "به‌روزرسانی"
                  : "افزودن به منو"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={pending}
                  className="flex-1"
                >
                  انصراف
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm shadow-emerald-50">
          <h2 className="mb-4 text-xl font-bold text-slate-900">لیست آیتم‌های منو</h2>
          {loading ? (
            <p className="text-sm text-slate-500">در حال بارگذاری...</p>
          ) : menuItems.length === 0 ? (
            <p className="text-sm text-slate-500">هنوز آیتمی به منو اضافه نشده است.</p>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{item.name}</h3>
                      {item.category && (
                        <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-lg font-bold text-emerald-600">
                        قیمت: {rial.format(item.price)}
                      </p>
                      {item.cost !== null && (
                        <p className="text-sm font-medium text-slate-600">
                          هزینه: {rial.format(item.cost)}
                        </p>
                      )}
                    </div>
                    {item.materials && item.materials.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.materials.map((material, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      disabled={pending}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={pending}
                      className="rounded-xl border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
