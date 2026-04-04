import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  normalizeSpotifyPlaylistId,
  SpotifyPlaylistValidationError,
  validateSpotifyPlaylistId,
} from "@/lib/spotify";

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        schedules: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const spotifyId = normalizeSpotifyPlaylistId(data.spotifyId);
    await validateSpotifyPlaylistId(spotifyId);

    const playlist = await prisma.playlist.create({
      data: {
        spotifyId,
        name: data.name,
        description: data.description || "",
        category: data.category || "Uncategorized",
      },
    });

    return NextResponse.json(playlist);
  } catch (error) {
    if (error instanceof SpotifyPlaylistValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
