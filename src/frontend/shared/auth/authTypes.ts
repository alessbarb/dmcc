export interface SessionCreds {
  activeRole?: "dm" | "player";
  activeUserId?: string;
  activeCampaignId?: string;
}

export interface AuthUser {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  vaultRole?: "admin" | "user" | string;
}

export interface AuthStatus {
  accountConfigured: boolean;
  dmAccountConfigured: boolean;
  dmPinConfigured: boolean; // backwards-compatible alias for accountConfigured
  legacyPinConfigured?: boolean;
  sessionValid: boolean;
  dmSessionValid: boolean; // backwards-compatible alias for sessionValid
  user: AuthUser | null;
  dm?: {
    dmId: string;
    userId?: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
  memberships?: Array<{
    campaignId: string;
    userId: string;
    role: "dm" | "player" | "observer";
    playerId?: string;
  }>;
  localRequest: boolean;
  lanExposed: boolean;
}
