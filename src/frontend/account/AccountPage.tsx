import { useEffect, useState } from "react";
import { fetchAccount } from "./accountClient.js";
import type { AccountAggregate } from "./accountTypes.js";

export function AccountPage() {
  const [account, setAccount] = useState<AccountAggregate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchAccount().then(setAccount).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to load account");
    });
  }, []);

  return (
    <main className="account-center">
      <h1>Account and profiles</h1>
      {error ? <p role="alert">{error}</p> : null}
      {!account && !error ? <p>Loading…</p> : null}
      {account ? <p>{account.account.displayName ?? account.account.email}</p> : null}
    </main>
  );
}
