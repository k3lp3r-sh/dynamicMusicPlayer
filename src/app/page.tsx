import { prisma } from "@/lib/db";
import PlayerPage from "@/components/player/PlayerPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  // Fetch playlists with schedules
  const playlists = await prisma.playlist.findMany({
    include: {
      schedules: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch site settings
  const settingsList = await prisma.siteSettings.findMany();
  const settings = settingsList.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const siteTitle = settings["siteTitle"] || "Truffles";
  const siteTagline = settings["siteTagline"] || "A premium auditory experience for your space";

  return (
    <PlayerPage
      playlists={playlists}
      siteTitle={siteTitle}
      siteTagline={siteTagline}
    />
  );
}
