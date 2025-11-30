export default function SalesLoading() {
  return (
    <section className="space-y-6 text-right">
      <header className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-emerald-100" />
        <div className="h-4 w-56 animate-pulse rounded bg-emerald-50" />
      </header>

      <div className="space-y-6">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-4 rounded-3xl border border-emerald-100 bg-white/60 p-6 shadow-sm">
            <div className="h-6 w-24 animate-pulse rounded bg-emerald-50" />
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-2xl bg-emerald-50/70" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
