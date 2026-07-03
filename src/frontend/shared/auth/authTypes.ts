export interface PlayerProfileEntry {
  campaignId: string;
  campaignTitle: string;
  playerId: string;
  displayName: string;
  email?: string;
  characterName?: string;
  lastAccessed: string;
  rememberToken?: boolean;
  avatarUrl?: string;
}

export interface DmProfileEntry {
  dmId: string;
  email: string;
  displayName?: string;
  lastAccessed: string;
  avatarUrl?: string;
}

export interface LocalIdentity {
  version: 1;
  serverOrigin: string;
  vaultId: string;
  dmProfiles: DmProfileEntry[];
  account?: {
    lastLoginAt?: string;
  };
  playerProfiles: PlayerProfileEntry[];
}

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
  dmProfiles: Array<{
    dmId: string;
    email: string;
    displayName?: string;
    lastLoginAt?: string;
  }>;
  memberships?: Array<{
    campaignId: string;
    userId: string;
    role: "dm" | "player" | "observer";
    playerId?: string;
  }>;
  localRequest: boolean;
  lanExposed: boolean;
}
