import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicMenuExplorer from "@/components/menu/PublicMenuExplorer";
import { prisma } from "@/lib/prisma";
import { parseUserIdFromShareSlug } from "@/lib/menuShare";
import type { PublicMenuSection } from "@/types/menu";

async function getMenuData(shareSlug: string) {
  const parsed = parseUserIdFromShareSlug(shareSlug);
  if (!parsed) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: {
      name: true,
      cafeImageUrl: true,
      instagramUrl: true,
      hasOnlineMenu: true,
      menuItems: {
        select: {
          id: true,
          name: true,
          price: true,
          category: true
        },
        orderBy: {
          price: "asc"
        }
      }
    }
  });

  if (!user || !user.hasOnlineMenu) {
    return null;
  }

  const grouped = new Map<string, PublicMenuSection["items"]>();
  for (const item of user.menuItems) {
    const category = item.category?.trim() || "بدون دسته‌بندی";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push({
      id: item.id,
      name: item.name,
      price: Number(item.price)
    });
  }

  const sections: PublicMenuSection[] = Array.from(grouped.entries())
    .sort(([a], [b]) => {
      if (a === "بدون دسته‌بندی") return 1;
      if (b === "بدون دسته‌بندی") return -1;
      return a.localeCompare(b, "fa");
    })
    .map(([category, items]) => ({
      category,
      items: items.sort((itemA, itemB) => itemA.price - itemB.price)
    }));

  return {
    cafeName: user.name,
    cafeImageUrl: user.cafeImageUrl,
    instagramUrl: user.instagramUrl,
    sections
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { shareSlug: string } }): Promise<Metadata> {
  const data = await getMenuData(params.shareSlug);
  if (!data) {
    return {
      title: "منوی سرو"
    };
  }

  return {
    title: `منوی ${data.cafeName}`,
    description: `مشاهده آنلاین منوی ${data.cafeName}`
  };
}

export default async function PublicMenuPage({ params }: { params: { shareSlug: string } }) {
  const data = await getMenuData(params.shareSlug);
  if (!data) {
    notFound();
  }

  const { cafeName, cafeImageUrl, instagramUrl, sections } = data;
  const cafeInitial = cafeName?.trim().charAt(0) || "س";
  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const totalCategories = sections.length;
  const instagramHandle = instagramUrl
    ? instagramUrl
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/\/.*$/, "")
    : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-right">
            <div className="flex flex-1 flex-col items-center gap-4 md:flex-row md:items-center md:gap-6">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
                {cafeImageUrl ? (
                  <img src={cafeImageUrl} alt={`${cafeName} logo`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-emerald-500">{cafeInitial}</div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Online Menu</p>
                <h1 className="text-4xl font-bold text-slate-900">{cafeName}</h1>
                <p className="text-sm text-slate-500">لیست تازه‌ترین نوشیدنی‌ها و خوراکی‌های کافه</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:gap-4">
              <span className="rounded-full border border-slate-200 px-4 py-1">
                {totalItems} آیتم
              </span>
              <span className="rounded-full border border-slate-200 px-4 py-1">
                {totalCategories} دسته‌بندی
              </span>
            </div>
          </div>
          {instagramUrl && (
            <div className="mt-4 flex justify-center md:justify-end">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <span>اینستاگرام</span>
                {instagramHandle && <span className="font-mono text-[11px]">@{instagramHandle}</span>}
              </a>
            </div>
          )}
        </section>

        {totalItems === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-200 bg-white/95 p-10 text-center shadow-inner">
            <p className="text-lg font-semibold text-slate-600">هنوز آیتمی برای نمایش ثبت نشده است.</p>
            <p className="mt-3 text-sm text-slate-400">به محض ثبت آیتم در داشبورد، این صفحه به‌روز خواهد شد.</p>
          </section>
        ) : (
          <PublicMenuExplorer sections={sections} />
        )}

        <footer className="text-center text-xs text-slate-400">
          <p>قدرت گرفته از سرو</p>
        </footer>
      </div>
    </div>
  );
}
