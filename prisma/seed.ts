import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const url =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  `file:${path.join(process.cwd(), "dev.db")}`;
const authToken =
  process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.schedule.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.siteSettings.deleteMany();

  // Seed site settings
  await prisma.siteSettings.createMany({
    data: [
      { key: "siteTitle", value: "Truffles" },
      { key: "siteTagline", value: "Curated sounds for your space" },
    ],
  });

  // Seed playlists across categories
  const playlists = await Promise.all([
    // Morning Chill
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWWQRwui0ExPn", name: "Lofi Beats", description: "Chill beats to start your morning with mellow vibes", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4sWSpwq3LiO", name: "Peaceful Piano", description: "Relax and unwind with beautiful piano pieces", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWZd79rJ6a7lp", name: "Sleep", description: "Gentle ambient sounds for a calm start", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX8A1R2V1D6cO", name: "Morning Acoustic", description: "Acoustic sounds to ease into the day", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWYcDQ1hSjOpY", name: "Deep Focus", description: "Keep calm and focus on your tasks with ambient tracks", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX3rxVfibe1L0", name: "Mood Booster", description: "Uplifting and warm morning tracks", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXc8kgYqQLKWv", name: "Wake Up Happy", description: "Start your day with a smile and upbeat tunes", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWVzZXIWNwxJF", name: "Chill Tracks", description: "Softer electronic and chillout tracks", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4E3UdUs7fUx", name: "Chill Vibes", description: "Laid back pop and R&B for early mornings", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXaImRpG7HXqI", name: "Bossa Nova Cover", description: "Smooth bosses covers for coffee mornings", category: "Morning Chill" },
    }),

    // Afternoon Energy
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXcBWIGoYBM5M", name: "Today's Top Hits", description: "The biggest hits right now, all in one playlist", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX0XUsuxWHRQd", name: "RapCaviar", description: "New music from the biggest names in hip-hop", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX76Wlfdnj7AP", name: "Beast Mode", description: "High-energy tracks to power through the afternoon", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX1lVhptIYRda", name: "Hot Country", description: "Top country tracks for an energetic push", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4SBhb3jqcj7", name: "Pop Rising", description: "The hits of tomorrow, fueling your afternoon", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWY4xHQp97COP", name: "Rock Classics", description: "Classic rock anthems to keep you moving", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWTJ7xPn4vNaz", name: "All Out 2010s", description: "Nostalgic pop and club hits from the 2010s", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX5Ejj0EkURtP", name: "All Out 2000s", description: "Throwback jams that bring intense energy", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXbTxeAdrVG2l", name: "All Out 90s", description: "The most iconic and energetic tracks of the 90s", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWTIzTcEVQ5Xl", name: "Hits Don't Lie", description: "Timeless energy-packed anthems", category: "Afternoon Energy" },
    }),

    // Evening Lounge
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWTwnEm1IYyoj", name: "Soft Pop Hits", description: "Smooth and soft pop for winding down", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX3rxVfibe1L0", name: "Happy Hits", description: "Feel-good vibes for an uplifting evening lounge", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4UK9T1yO8gW", name: "Lounge Soft", description: "Perfect lounge atmosphere with soft grooves", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWWEJlAGA9gs0", name: "Classical Essentials", description: "Beautiful classical works", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWUa8ZRTfalHk", name: "Pop Chillout", description: "Lowkey pop to transition into the evening", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4sWSpwq3LiO", name: "Piano Covers", description: "Beautiful piano renditions of popular songs", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWTR4ZOXTfd9K", name: "Jazz Vibes", description: "Smooth jazz for a classy evening lounge feel", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX0SM0LYsmbMT", name: "Jazz in the Background", description: "Sip wine to an ambient jazz backdrop", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWV7EzJMK2FUI", name: "Jazzy Romance", description: "Warm and romantic evenings", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXb57FjYWz00c", name: "80s Hits", description: "Relaxing with nostalgic synthesizers from the 80s", category: "Evening Lounge" },
    }),

    // Late Night
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX2TRYkJECvfC", name: "Deep House Relax", description: "Deep, smooth house beats for the late hours", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4dyzvuaRJ0n", name: "mint", description: "Fresh electronic music and underground gems", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXa8NOEUOYkr0", name: "Night Rider", description: "Dark synths and driving beats for after midnight", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXc8kgYqQLKWv", name: "Night Pop", description: "Slower pop songs with a melancholic night-time vibe", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWXRqgorJj26U", name: "Rock Ballads", description: "Stadium rock ballads perfect for staring at the stars", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX9uKNf5jGX6m", name: "Late Night Jazz", description: "Slow, intimate late-night jazz", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWYmSg58uBxnT", name: "Dark Academia", description: "Classical tracks suited for nocturnal studying", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWZd79rJ6a7lp", name: "Deep Sleep", description: "Soothing tracks designed for falling asleep", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX8Uebhn9wzrS", name: "Night Rain", description: "Rain sounds mixed with ambient textures", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWV7EzJMK2FUI", name: "Lofi Night", description: "Late night lofi beats to wind down and study to", category: "Late Night" },
    }),
  ]);

  // Create schedules for each playlist based on category
  const scheduleMap: Record<string, { start: string; end: string }> = {
    "Morning Chill": { start: "06:00", end: "11:00" },
    "Afternoon Energy": { start: "11:00", end: "16:00" },
    "Evening Lounge": { start: "16:00", end: "21:00" },
    "Late Night": { start: "21:00", end: "23:59" },
  };

  for (const playlist of playlists) {
    const schedule = scheduleMap[playlist.category];
    if (schedule) {
      await prisma.schedule.create({
        data: {
          playlistId: playlist.id,
          dayOfWeek: 7, // All days
          startTime: schedule.start,
          endTime: schedule.end,
        },
      });
    }
  }

  console.log("✅ Seeded database with playlists and schedules");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
