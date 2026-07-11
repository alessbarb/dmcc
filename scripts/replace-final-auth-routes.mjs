import { readFileSync, writeFileSync } from "node:fs";

const files = [
  "src/frontend/MainLanding.tsx",
  "src/frontend/shared/auth/ForgotPasswordPage.tsx",
  "src/frontend/shared/auth/ResetPasswordPage.tsx",
];

for (const path of files) {
  let source = readFileSync(path, "utf8");
  source = source.replaceAll('to: "/login"', 'to: "/dm/login"');
  source = source.replaceAll('to: "/register"', 'to: "/dm/setup"');
  writeFileSync(path, source);
}
