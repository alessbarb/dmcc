interface MobilePrivacyBannerProps {
  tablePrivacy: boolean;
  onToggle?: () => void;
}

export function MobilePrivacyBanner({ tablePrivacy, onToggle }: MobilePrivacyBannerProps) {
  return (
    <button type="button" className={`mobile-privacy-banner ${tablePrivacy ? "is-safe" : "is-private"}`} onClick={onToggle} aria-pressed={tablePrivacy}>
      {tablePrivacy ? "Modo mesa seguro" : "Privado DM activo"}
    </button>
  );
}
