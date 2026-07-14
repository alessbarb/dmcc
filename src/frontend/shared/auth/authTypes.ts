export interface AuthUser {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  isPlatformAdmin?: boolean;
}

export interface AuthStatus {
  sessionValid: boolean;
  user: AuthUser | null;
  memberships?: Array<{
    campaignId: string;
    userId: string;
    role: "dm" | "co_dm" | "player";
    playerId?: string | null;
  }>;
}
