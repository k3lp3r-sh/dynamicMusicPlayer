import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL;
const authToken =
  process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "Missing DATABASE_URL (or TURSO_DATABASE_URL). This seed script targets the remote Turso database only."
  );
}

if (!authToken) {
  throw new Error(
    "Missing DATABASE_AUTH_TOKEN (or TURSO_AUTH_TOKEN) for the remote Turso database."
  );
}

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
      { key: "siteTagline", value: "A premium auditory experience for your space" },
    ],
  });

  // Seed playlists across categories
  const playlists = await Promise.all([
    // Morning Chill
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX3rxVfibe1L0", name: "Mood Booster", description: "Uplifting and warm morning tracks", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXdPec7aLTmlC", name: "Wake Up Happy", description: "Start your day with a smile and upbeat tunes", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWT3gM3xdPT0c", name: "Morning Acoustic", description: "Acoustic sounds to ease into the day", category: "Morning Chill" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4E3UdUs7fUx", name: "Chill Vibes", description: "Laid back pop and R&B for early mornings", category: "Morning Chill" },
    }),

    // Afternoon Energy
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXcBWIGoYBM5M", name: "Today's Top Hits", description: "The biggest hits right now, all in one playlist", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX5Ejj0EkURtP", name: "All Out 2000s", description: "Throwback jams that bring intense energy", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWUa8ZRTfalHk", name: "Pop Rising", description: "The hits of tomorrow, fueling your afternoon", category: "Afternoon Energy" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX2M1RktxUUHG", name: "Hits Don't Lie", description: "Timeless energy-packed anthems", category: "Afternoon Energy" },
    }),

    // Evening Lounge
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX3rxVfibe1L0", name: "Happy Hits", description: "Feel-good vibes for an uplifting evening lounge", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWTwnEm1IYyoj", name: "Soft Pop Hits", description: "Smooth and soft pop for winding down", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXb57FjYWz00c", name: "80s Hits", description: "Relaxing with nostalgic synthesizers from the 80s", category: "Evening Lounge" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWUa8ZRTfalHk", name: "Pop Chillout", description: "Lowkey pop to transition into the evening", category: "Evening Lounge" },
    }),

    // Late Night
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX4dyzvuaRJ0n", name: "mint", description: "Fresh electronic music and underground gems", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DXbcP8BbYEQaO", name: "Night Pop", description: "Slower pop songs with a melancholic night-time vibe", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DX2TRYkJECvfC", name: "Deep House Relax", description: "Deep, smooth house beats for the late hours", category: "Late Night" },
    }),
    prisma.playlist.create({
      data: { spotifyId: "37i9dQZF1DWV7EzJMK2FUI", name: "Lofi Night", description: "Late night lofi beats to wind down", category: "Late Night" },
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
