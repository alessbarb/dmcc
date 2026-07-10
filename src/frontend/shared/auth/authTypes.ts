export interface AuthUser {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthStatus {
  accountConfigured: boolean;
  sessionValid: boolean;
  user: AuthUser | null;
  memberships?: Array<{
    campaignId: string;
    userId: string;
    role: "dm" | "co_dm" | "player" | "observer";
    playerId?: string | null;
  }>;
}
