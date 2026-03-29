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
      <aside className="w-64 bg-surface border-r border-border-light flex flex-col">
        <div className="p-6 border-b border-border-light">
          <Logo />
          <p className="mt-2 text-xs text-text-muted font-medium uppercase tracking-wider">
            Admin Dashboard
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-text-secondary hover:text-white transition-colors"
          >
            📊 Overview
          </Link>
          <Link
            href="/admin/playlists"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-text-secondary hover:text-white transition-colors"
          >
            🎧 Playlists
          </Link>
          <Link
            href="/admin/schedules"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-text-secondary hover:text-white transition-colors"
          >
            📅 Schedules
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-text-secondary hover:text-white transition-colors"
          >
            ⚙️ Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border-light">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-elevated text-primary text-sm font-medium transition-colors"
          >
            ← Back to Player
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
