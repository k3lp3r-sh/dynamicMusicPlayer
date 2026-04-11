import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [playlistCount, scheduleCount] = await Promise.all([
    prisma.playlist.count(),
    prisma.schedule.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold tracking-tight mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div className="p-6 rounded border border-border bg-surface">
          <p className="text-xs text-text-muted uppercase tracking-[0.1em] mb-2">Playlists</p>
          <p className="text-3xl font-display font-semibold text-text-primary">{playlistCount}</p>
        </div>
        
        <div className="p-6 rounded border border-border bg-surface">
          <p className="text-xs text-text-muted uppercase tracking-[0.1em] mb-2">Schedules</p>
          <p className="text-3xl font-display font-semibold text-text-primary">{scheduleCount}</p>
        </div>
      </div>

      <div className="p-6 rounded border border-border bg-surface">
        <h2 className="text-lg font-display font-medium tracking-tight mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/admin/playlists"
            className="px-4 py-2 bg-accent text-black text-sm font-medium rounded transition-colors hover:opacity-90"
          >
            + Add Playlist
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-surface-elevated border border-border text-text-primary text-sm font-medium rounded transition-colors hover:bg-surface-hover"
          >
            View Player
          </Link>
        </div>
      </div>
    </div>
  );
}
