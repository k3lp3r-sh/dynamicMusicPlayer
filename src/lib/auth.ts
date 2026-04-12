"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

// Hash utility function using native node crypto
function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

// Ensure the hashes match strictly what you defined
const HASHES = {
  home: "ff1b43fc917f974e3dd1c085ec32d2138092c45e3e7e2ed3f8158224e28900ec", // user@truffles
  admin: "3c8c898c8c9b93faa3130cf8a5cbd90b6023944b16456d4ba951e0979d95094c", // admin@sycf.in##1
};

export async function loginAction(
  username: string,
  rawPass: string,
  targetRoute: string
) {
  const hashedInput = sha256(rawPass);

  // Determine what level of clearance they are trying to achieve based on the target route
  const isAdminRoute = targetRoute.startsWith("/admin");

  if (isAdminRoute) {
    if (username === "admin" && hashedInput === HASHES.admin) {
      const cookieStore = await cookies();
      cookieStore.set("auth_role", "admin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 Week
      });
      return { success: true };
    }
  } else {
    // If they are logging in from the base public entry or trying to access it,
    // they can either use the `user` credential or the `admin` credential.
    if (username === "truffles" && hashedInput === HASHES.home) {
      const cookieStore = await cookies();
      cookieStore.set("auth_role", "user", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { success: true };
    } else if (username === "admin" && hashedInput === HASHES.admin) {
      // Super user can also login from the public portal and get top clearance
      const cookieStore = await cookies();
      cookieStore.set("auth_role", "admin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { success: true };
    }
  }

  return { success: false, error: "Invalid username or password." };
}
