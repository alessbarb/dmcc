import { useEffect, useState } from "react";

const STORAGE_KEY = "dmcc.mobile.tablePrivacy";

export function useMobilePrivacyMode() {
  const [tablePrivacy, setTablePrivacy] = useState(() => {
    if (typeof localStorage === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) !== "false";
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(tablePrivacy));
  }, [tablePrivacy]);
  return {
    tablePrivacy,
    enablePrivacy: () => setTablePrivacy(true),
    disablePrivacy: () => setTablePrivacy(false),
    togglePrivacy: () => setTablePrivacy((value) => !value),
  };
}
