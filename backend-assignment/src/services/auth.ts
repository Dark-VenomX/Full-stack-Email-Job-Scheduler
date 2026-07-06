export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "google";
}

export async function verifyGoogleToken(token: string): Promise<AuthUser> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) throw new Error("Invalid token");
    const payload = (await res.json()) as any;

    return {
      id: payload.id,
      name: payload.name || "Unknown",
      email: payload.email || "",
      avatar: payload.picture || "",
      provider: "google",
    };
  } catch (err) {
    console.error("[auth] Google token verification failed:", err);
    throw new Error("Invalid Google token");
  }
}
