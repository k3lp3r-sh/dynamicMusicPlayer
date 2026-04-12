import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.length !== 22) {
      return NextResponse.json(
        { error: "Invalid Spotify Playlist ID." },
        { status: 400 }
      );
    }

    const response = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 3600 }, // Cache the scrape for 1 hour to prevent rate limiting
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch playlist from Spotify." },
        { status: 502 }
      );
    }

    const html = await response.text();

    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/
    );
    if (!match) {
      return NextResponse.json(
        { error: "Could not locate track data in Spotify response." },
        { status: 500 }
      );
    }

    const json = JSON.parse(match[1]);
    const trackList = json.props?.pageProps?.state?.data?.entity?.trackList;

    if (!trackList || !Array.isArray(trackList)) {
      return NextResponse.json(
        { error: "Track list is missing or invalid." },
        { status: 500 }
      );
    }

    // Map to a cleaner format, immediately filtering out "E" (Explicit) tagged songs
    const extractedTracks = trackList
      .filter((t: any) => t.isExplicit !== true)
      .map((t: any) => ({
        uri: t.uri,
        title: t.title,
        subtitle: t.subtitle,
        duration: t.duration,
      }));

    return NextResponse.json({ tracks: extractedTracks });
  } catch (err: any) {
    console.error("Spotify Track Scrape Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
