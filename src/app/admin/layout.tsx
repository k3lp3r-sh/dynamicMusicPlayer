import Link from "next/link";
import Logo from "@/components/player/Logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="w-60 bg-surface border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Logo />
          <p className="mt-2 text-[10px] text-text-muted font-medium uppercase tracking-[0.15em]">
            Admin
          </p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/admin/playlists"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Playlists
          </Link>
          <Link
            href="/admin/schedules"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Schedules
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Settings
          </Link>
        </nav>
        
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded text-sm text-accent hover:bg-accent-dim transition-colors"
          >
            ← Player
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
