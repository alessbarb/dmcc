export type PlatformRole = "dm" | "player" | "admin";

export interface AuthUser {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: PlatformRole[];
}

export interface Session {
  sessionValid: boolean;
  user: AuthUser | null;
}
