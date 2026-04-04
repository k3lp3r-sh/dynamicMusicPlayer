import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  normalizeSpotifyPlaylistId,
  SpotifyPlaylistValidationError,
  validateSpotifyPlaylistId,
} from "@/lib/spotify";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const spotifyId = normalizeSpotifyPlaylistId(data.spotifyId);
    await validateSpotifyPlaylistId(spotifyId);

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        spotifyId,
        name: data.name,
        description: data.description,
        category: data.category,
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

    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Failed to update playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.playlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
