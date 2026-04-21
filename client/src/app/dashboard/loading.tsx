import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a dashboard route chunk loads. Mirrors the AppShell chrome
 * (sidebar rail + top bar) so navigation doesn&apos;t feel like a hard flash.
 */
export default function DashboardLoading() {
  return (
    <div className="bg-background flex h-screen">
      <aside className="border-border flex h-full w-60 shrink-0 flex-col border-r">
        <div className="border-border flex h-14 items-center border-b px-4">
          <Skeleton className="h-7 w-20" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </nav>
        <div className="border-border border-t p-3">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex h-14 shrink-0 items-center justify-between gap-4 border-b px-6">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-6xl space-y-6 px-6 py-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
