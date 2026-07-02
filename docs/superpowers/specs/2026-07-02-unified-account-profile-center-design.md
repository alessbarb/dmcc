# Unified Account Profile Center Design

**Date:** 2026-07-02

**Status:** Approved design

**Scope:** A shared account and profile center for DM and player users

## Objective

Create one global account center that works identically from the DM workspace
and the player portal while preserving the distinction between:

- private account and security data;
- one public-facing DM profile per account;
- one player profile per campaign membership;
- characters, which remain separate campaign entities.

The design must work in the current local/LAN application and establish stable
privacy semantics for a future hosted web and native app.

## Product Principles

1. A person has one account and one set of credentials.
2. Roles come from campaign memberships, not separate DM and player accounts.
3. Social profiles are contextual and never contain authentication secrets.
4. Player identity and character identity remain separate.
5. Hidden fields are removed by server projections, not hidden in the browser.
6. No local field becomes anonymously public merely because it is marked
   global.
7. Settings are saved by module rather than through one account-wide mutation.
8. Destructive operations require explicit confirmation and preserve campaign
   integrity.

## Information Architecture

The account center lives at the global route `/account`, outside any campaign.
It is available from the account/avatar menu in both DM and player surfaces.
The route records the originating location so the header can offer a meaningful
return action such as "Back to The Triple Eclipse".

The account center contains these modules:

1. Account
2. DM profile
3. Player profiles
4. Privacy and public profile
5. Appearance and accessibility
6. Notifications
7. Security and sessions
8. Data and account deletion

On desktop, the identity summary and module navigation remain in a sidebar
while one module occupies the content panel. On mobile, the root view is a
module index and each module opens as a focused subpage. Each module owns its
save and discard actions.

## Data Boundaries

### UserAccount

`UserAccount` remains the authentication authority and contains only private
identity and credential data:

- user ID;
- normalized email and email hash;
- default display name and avatar;
- password material;
- vault role;
- account lifecycle timestamps.

The email is private and must never be reused as a public identifier.

### UserPreferences

`UserPreferences` is a separate versioned resource containing:

- locale and time format;
- visual theme ID;
- color mode;
- typography set ID;
- density;
- text scale;
- enhanced contrast;
- reduced motion;
- interface sounds;
- global internal-notification preferences.

Keeping this resource separate prevents routine authentication reads from
loading presentation and notification configuration.

### DmSocialProfile

Each account has at most one DM social profile per vault:

- public display name;
- avatar;
- pronouns;
- time zone;
- biography;
- contact preferences;
- visibility configuration for each social field;
- public handle;
- publication state;
- resource version.

The profile can be prepared before the account receives a DM membership. It is
shown as a DM profile only where the account has an active DM role.

### Campaign Player Profile

Each active player membership links to one campaign player profile and its
registered `playerId`. It contains the same social fields and per-field
visibility controls as the DM profile.

When created, the profile copies account defaults. It then evolves
independently. Later changes to account defaults do not silently overwrite
existing player profiles. The account UI may offer an explicit action to copy
selected defaults into selected profiles.

Campaign player profiles may reference linked characters for orientation, but
character name, portrait, biography, and game statistics stay in character
entities.

Revoked memberships and archived campaigns appear in a secondary archived
profiles area rather than alongside active profiles.

## Visibility and Public Profile

Every configurable social field has one of four audiences:

- `private`: visible only to the owning account;
- `dm`: visible to the owning account and active DMs of the relevant campaign;
- `table`: visible to active members of the relevant campaign;
- `global`: eligible for the account's public profile projection.

The server restricts nonsensical audience options by context. For example, a DM
profile does not need a `dm` audience that only means showing the field back to
the same DM.

Recommended defaults are:

| Field | Default audience |
|---|---|
| Email | Private and not configurable as a social field |
| Public name | Table |
| Avatar | Table |
| Pronouns | Table |
| Time zone | Table |
| Biography | Table |
| Contact preferences | DM |

The privacy module provides previews for:

- another player;
- a campaign DM;
- the owning account;
- the global public profile.

### Global Publication

`global` is a durable audience for a future hosted web/native application. It
does not mean anonymous LAN access in the local product.

The social profile includes:

- a stable `publicHandle` distinct from the email;
- publication state `private`, `unlisted`, or `published`;
- a dedicated restrictive global DTO.

The handle is normalized and reserved within the current vault. The design does
not assume global uniqueness across future servers. A hosted service may add a
separate global reservation process without changing profile semantics.

During the local stage:

- global fields can be selected and previewed;
- the global DTO is available only to authenticated accounts in the same vault;
- neither `unlisted` nor `published` creates an anonymous LAN URL;
- publishing requires explicit confirmation.

Moving to the hosted product must not publish existing profiles
automatically. The user must explicitly enable hosted publication. Unpublishing
immediately removes the global projection without deleting profile data.

## Account Editing

The Account module manages:

- default avatar;
- default display name;
- private email;
- locale;
- time format.

Changing the email requires the current password and revokes every session
except the current one. Existing social profiles are not updated automatically.

Each social profile editor includes a preview, field-level validation,
visibility selectors, save, discard, and an explicit reset-to-default action.
Navigation away from a dirty module requires confirmation.

Every editable resource has a version. A stale update returns `409 Conflict`.
The client reloads current server data while preserving a local copy of the
user's unsaved values for comparison; it never silently chooses a winner.

## Appearance System

Mode, theme, and typography are independent preferences.

### Color Mode

Color mode is one of:

- `system`;
- `light`;
- `dark`.

`system` resolves to the light or dark variant supplied by the selected theme.

### Visual Theme Packages

A visual theme controls aesthetic character rather than brightness. The
existing design becomes the default package; future examples could include
high fantasy, steampunk, or cosmic horror.

Each registered package declares:

- stable theme ID;
- translatable name;
- light and dark variants;
- semantic color tokens;
- surfaces, borders, shadows, and interactive states;
- compatibility with enhanced contrast;
- preview metadata;
- theme-contract version.

Preferences store `themeId` and `colorMode`, not arbitrary colors. The first
release does not need additional theme packages, but the registry and contract
must support them.

### Typography Packages

A typography package declares:

- heading family;
- interface/body family;
- optional monospace family;
- supported weights;
- type scale and spacing adjustments;
- local asset and license metadata.

The existing Cinzel and Outfit pairing becomes the default package. The
registry must allow future editorial, highly readable, industrial, or modern
sets. The first release does not allow arbitrary font uploads because of
licensing, performance, safety, and readability risks.

### Accessibility Overrides

Text scale, enhanced contrast, and reduced motion are applied above the chosen
theme. A theme package that cannot satisfy the contrast contract is not
available. Theme and typography controls provide a combined preview and do not
rely on color alone to communicate selection.

## Account and Device Preferences

The account synchronizes all preference defaults. A device may locally override:

- theme;
- color mode;
- typography package;
- density;
- text scale;
- enhanced contrast;
- reduced motion;
- interface sounds.

Each control indicates whether it uses the account value or a device override.
The UI can remove one override or restore all settings on the device to account
defaults. Device overrides contain presentation only, never identity or
security data.

## Internal Notifications

The first release stores preferences only for internal capabilities:

- invitations and membership changes;
- relevant campaign activity;
- session reminders;
- direct mentions or messages when that capability exists.

The model supports a global policy plus campaign exceptions. Email and push
controls are not shown until those delivery channels exist. The data contract
may add channels later without changing the meaning of existing preferences.

## Security and Sessions

The Security module supports:

- password change using the current password;
- recovery-code regeneration;
- one-time display of new recovery codes and acknowledgement that they were
  saved;
- a session list with approximate device description, creation time, last
  activity, and current-session marker;
- individual session revocation;
- revoking every other session;
- signing out every session.

Session metadata must be minimal and useful for recognition. It must not become
invasive device fingerprinting. Sensitive mutations require same-origin
protection and are never automatically retried.

## Data Export and Account Deletion

The personal-data export is machine-readable and includes account identity,
preferences, profiles, visibility settings, and memberships. It excludes
password material, session cookies, hashes, reset tokens, and recovery codes.
Campaign content continues to use campaign export because it can involve
multiple people.

Account deletion follows this flow:

1. Show memberships, social profiles, and campaigns administered exclusively
   by the account.
2. Block deletion while any campaign lacks another responsible DM.
3. Require responsibility transfer, or explicit campaign export and deletion.
4. Require the current password.
5. Require typing the public handle, or email if no handle exists.
6. Revoke all sessions.
7. Delete credentials and social profiles.
8. Replace historical attribution that must remain for campaign integrity with
   a neutral "Deleted user" identity.

Account deletion never silently deletes campaigns or corrupts narrative event
history.

## API Design

The private account bootstrap can return an aggregate read model containing:

- private identity;
- preferences;
- DM profile;
- campaign player profile summaries;
- privacy and publication configuration;
- session summary;
- deletion blockers.

Mutations stay separated by responsibility:

- private identity and email;
- preferences;
- DM profile;
- one campaign player profile;
- privacy and publication;
- password and recovery codes;
- session revocation;
- personal-data export;
- account deletion.

There is no generic endpoint that can replace the complete authentication
document.

The server exposes distinct projections:

1. owner-private projection;
2. campaign-DM projection;
3. campaign-table projection;
4. global public projection;
5. authenticated local preview of the global projection.

Authorization derives from the authenticated account and current campaign
membership. Email, security configuration, sessions, and private preferences
are absent from every social projection.

## Validation and Error Handling

- Validate lengths, formats, safe image URLs, handles, and supported registry
  IDs on the server.
- Return field-level errors for normal form failures.
- Bound biography and contact fields.
- Return `409 Conflict` for stale resource versions.
- Retry reads only; do not automatically retry sensitive or destructive writes.
- Report the actual result of independent module saves rather than implying an
  account-wide transaction.
- Move focus to the first invalid field and announce save results through an
  accessible live region.

## Accessibility

- All navigation and controls work by keyboard.
- Inputs have explicit labels, descriptions, and error associations.
- Theme and typography samples are proper controls with non-color state.
- Reduced-motion and text-scale changes apply immediately to previews.
- Destructive confirmations use accessible dialogs with deliberate initial
  focus.
- Mobile actions remain reachable without hover or hidden pointer gestures.

## Test Strategy

### Backend

- Validate updates for every resource.
- Exercise the complete audience-by-requester-by-campaign matrix.
- Prove that email and private fields cannot leak through social DTOs.
- Verify publication, unpublication, and local global-profile restrictions.
- Verify session listing and revocation.
- Verify optimistic concurrency conflicts.
- Verify export excludes all secrets.
- Verify deletion is blocked for the sole responsible DM.
- Verify historical campaign attribution survives account deletion safely.

### Frontend

- Enter the same `/account` route from DM and player surfaces.
- Exercise desktop sidebar and mobile drill-down navigation.
- Verify dirty-state protection, save, discard, and field errors.
- Verify inherited profile defaults and explicit resets.
- Verify privacy previews for owner, DM, table, and global audiences.
- Verify account defaults and device overrides.
- Verify the theme, color-mode, and typography combination.
- Exercise recovery, session, export, and deletion flows.
- Verify keyboard navigation, focus management, and live announcements.

### Integration

- One account acts as DM in one campaign and player in another.
- The same account has different player profiles in different campaigns.
- A global profile is published and then withdrawn.
- One device revokes a session being used by another device.
- Account deletion remains blocked until sole-DM responsibilities are resolved.

## Explicit Non-Goals for the First Release

- Anonymous public profile URLs on LAN.
- Hosted cross-server handle uniqueness.
- Additional visual theme artwork or branded theme packages.
- Arbitrary user-uploaded fonts or themes.
- Email or push notification delivery.
- Combining player identity with character sheets.
- Silently propagating account identity changes into existing social profiles.
