"use client";

import { useState, useEffect } from "react";
import SpotifyEmbed from "@/components/player/SpotifyEmbed";

export default function PlaylistsAdmin() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Morning Chill");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const extractSpotifyId = (url: string) => {
    // Handle full URL "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=..."
    // Handle URI "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"
    // Handle raw ID "37i9dQZF1DXcBWIGoYBM5M"
    const match = url.match(/playlist[\/:]?([a-zA-Z0-9]+)/);
    if (match) return match[1];
    if (url.length === 22 && !url.includes("/")) return url;
    return "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const spotifyId = extractSpotifyId(spotifyUrl);
    if (!spotifyId) {
      alert("Invalid Spotify URL or ID");
      setSaving(false);
      return;
    }

    try {
      await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyId, name, description, category }),
      });
      
      setIsAdding(false);
      setSpotifyUrl("");
      setName("");
      setDescription("");
      await fetchPlaylists();
    } catch (e) {
      console.error(e);
      alert("Failed to save playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const previewId = extractSpotifyId(spotifyUrl);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Playlists</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-primary hover:bg-primary-glow rounded-lg font-medium transition-colors text-white"
        >
          {isAdding ? "Cancel" : "+ Add Playlist"}
        </button>
      </div>

      {isAdding && (
        <div className="glass p-6 rounded-xl border border-border mb-8 animate-fade-up">
          <h2 className="text-xl font-bold mb-4">Add New Playlist</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Spotify URL or ID</label>
                <input
                  required
                  type="text"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Display Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Category / Time of Day</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                >
                  <option value="Morning Chill">🌅 Morning Chill</option>
                  <option value="Afternoon Energy">⚡ Afternoon Energy</option>
                  <option value="Evening Lounge">🌆 Evening Lounge</option>
                  <option value="Late Night">🌙 Late Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white resize-none"
                />
              </div>
              <button
                disabled={saving}
                type="submit"
                className="w-full py-3 bg-success hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors mt-2"
              >
                {saving ? "Saving..." : "Save Playlist"}
              </button>
            </div>
            
            <div className="bg-surface rounded-xl p-4 border border-border flex flex-col justify-center items-center min-h-[300px]">
              {previewId ? (
                <div className="w-full">
                  <p className="text-sm text-center text-text-secondary mb-4">Preview</p>
                  <SpotifyEmbed spotifyId={previewId} />
                </div>
              ) : (
                <p className="text-text-muted">Enter a valid URL to see preview</p>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading playlists...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {playlists.map((pl) => (
            <div key={pl.id} className="glass rounded-xl p-5 border border-border flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-semibold text-lg">{pl.name}</h3>
                <span className="text-xs bg-surface-elevated px-2 py-1 rounded-full text-text-secondary">
                  {pl.category}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">{pl.description}</p>
              
              <div className="mt-auto pt-4 border-t border-border-light flex justify-between items-center text-sm">
                <span className="text-text-muted font-mono">{pl.spotifyId}</span>
                <button
                  onClick={() => handleDelete(pl.id)}
                  className="text-danger hover:text-red-400 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
