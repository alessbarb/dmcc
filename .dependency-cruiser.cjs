/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
        pathNot: "^(vite/client|vite-plugin-pwa/client|virtual:pwa-register/react)$",
      },
    },
    {
      name: "no-circular",
      severity: "warn",
      from: { pathNot: "^(node_modules)" },
      to: { circular: true },
    },
    {
      name: "not-from-core-to-ui-or-infra",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/(frontend|backend)/" },
    },
    {
      name: "not-from-backend-to-frontend",
      severity: "error",
      from: { path: "^src/backend/" },
      to: { path: "^src/frontend/" },
    },
    {
      name: "not-from-frontend-to-backend",
      severity: "error",
      from: { path: "^src/frontend/" },
      to: { path: "^src/backend/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: "^(dist|release|test-results)/",
    },
    tsConfig: {
      fileName: "tsconfig.node.json",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
