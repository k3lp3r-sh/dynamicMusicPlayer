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
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-strong p-6 rounded-xl border border-border">
          <h3 className="text-text-secondary font-medium mb-2">Total Playlists</h3>
          <p className="text-4xl font-display font-bold text-primary-light">{playlistCount}</p>
        </div>
        
        <div className="glass-strong p-6 rounded-xl border border-border">
          <h3 className="text-text-secondary font-medium mb-2">Active Schedules</h3>
          <p className="text-4xl font-display font-bold text-accent-glow">{scheduleCount}</p>
        </div>
      </div>

      <div className="glass p-8 rounded-xl border border-border">
        <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/playlists"
            className="px-4 py-2 bg-primary hover:bg-primary-glow text-white rounded-lg font-medium transition-all hover:scale-105"
          >
            + Add New Playlist
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-white rounded-lg font-medium transition-all"
          >
            View Live Player
          </Link>
        </div>
      </div>
    </div>
  );
}
